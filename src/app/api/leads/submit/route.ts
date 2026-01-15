import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendWelcomeEmail } from '@/lib/mailer';
import { mapBudgetToTier } from '@/lib/budget-mapping';

import { LeadStatus, BudgetTier } from '@prisma/client';

// Helper to get user-friendly service type display name
function getServiceDisplayName(serviceType: string): string {
  const mapping: Record<string, string> = {
    'BUSINESS_WEBSITE': 'Business Website',
    'NONPROFIT_WEBSITE': 'Nonprofit Website',
    'PERSONAL_WEBSITE': 'Personal Website',
    'MAINTENANCE_PLAN': 'Website Maintenance',
  };
  return mapping[serviceType] || serviceType;
}

// Helper to generate clean project description
function generateProjectDescription(data: {
  serviceType: string;
  projectGoals?: string;
  maintenanceNeeds?: string[];
  urgency?: string;
  websiteUrl?: string;
  timeline?: string;
}): string {
  const serviceName = getServiceDisplayName(data.serviceType);
  
  // For maintenance plans, format specially
  if (data.serviceType === 'MAINTENANCE_PLAN') {
    const parts: string[] = [];
    
    if (data.maintenanceNeeds && data.maintenanceNeeds.length > 0) {
      parts.push(`Services needed: ${data.maintenanceNeeds.join(', ')}`);
    }
    
    if (data.websiteUrl) {
      parts.push(`Website: ${data.websiteUrl}`);
    }
    
    if (data.urgency) {
      parts.push(`Priority: ${data.urgency}`);
    }
    
    if (data.projectGoals && !data.projectGoals.startsWith('Maintenance needs:')) {
      parts.push(`Additional details: ${data.projectGoals}`);
    }
    
    return parts.length > 0 
      ? `${serviceName} request. ${parts.join('. ')}`
      : `${serviceName} request`;
  }
  
  // For other project types
  if (data.projectGoals) {
    return data.projectGoals.length > 200 
      ? data.projectGoals.substring(0, 200) + '...'
      : data.projectGoals;
  }
  
  return `${serviceName} project`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // REJECT LEGACY QUESTIONNAIRE FIELDS - SeeZee V2 Migration
    // These fields are from the old questionnaire system and should no longer be accepted
    const legacyFields = ['qid', 'packageId', 'selectedFeatures', 'answers', 'package'];
    const hasLegacyFields = legacyFields.some(field => field in body);
    
    if (hasLegacyFields) {
      return NextResponse.json(
        { 
          error: 'Invalid request format. The old questionnaire system is no longer supported. Please use the new service intake form.',
          code: 'LEGACY_FORMAT_REJECTED'
        },
        { status: 400 }
      );
    }

    // Get the authenticated user's session (optional for new flow)
    const session = await auth();
    
    // Extract data from new simplified format
    const { 
      serviceType, email, name, phone, company, projectGoals, budget, timeline, 
      nonprofitStatus, nonprofitEIN, attachments,
      // Maintenance-specific fields
      maintenanceNeeds, maintenanceTier, urgency, websiteUrl, websitePlatform, hasAccessCredentials,
      // Hours tracking
      estimatedHours
    } = body;
    
    // Validate required fields for new flow
    if (!serviceType || !email || !name || !projectGoals) {
      return NextResponse.json({ error: 'Missing required fields: serviceType, email, name, projectGoals' }, { status: 400 });
    }
    
    // Get or create user
    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true, email: true },
      });
    }
    
    // If no authenticated user, try to find or create by email
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email: email },
        select: { id: true, name: true, email: true },
      });
      
      // Create user if they don't exist (for unauthenticated submissions)
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email,
            name: name,
            role: 'CLIENT',
          },
          select: { id: true, name: true, email: true },
        });
      }
    }
    
    // EARLY DUPLICATE CHECK: Prevent double-submission before checking active requests
    // Check if a lead with same email + serviceType was created in last 5 minutes
    if (email && serviceType) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentDuplicate = await prisma.lead.findFirst({
        where: {
          email: email,
          serviceType: serviceType,
          createdAt: { gte: fiveMinutesAgo },
        },
        include: {
          project: true,
        },
      });
      
      if (recentDuplicate) {
        console.log(`[DUPLICATE PREVENTION] Found existing lead ${recentDuplicate.id} for ${email} (${serviceType}) created at ${recentDuplicate.createdAt}, blocking duplicate`);
        
        // Find associated project request
        const existingRequest = user ? await prisma.projectRequest.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        }) : null;
        
        return NextResponse.json({
          success: true,
          leadId: recentDuplicate.id,
          projectRequestId: existingRequest?.id || null,
          projectId: recentDuplicate.project?.id || null,
          message: 'Request already submitted (duplicate prevented)',
        });
      }
    }

    // Check for active project requests if user exists (only if not a recent duplicate)
    if (user) {
      const activeRequests = await prisma.projectRequest.findMany({
        where: {
          userId: user.id,
          status: {
            in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'],
          },
        },
      });

      if (activeRequests.length > 0) {
        return NextResponse.json(
          { 
            error: 'You already have an active project request. Please wait for it to be reviewed before submitting a new one.',
            activeRequest: {
              id: activeRequests[0].id,
              title: activeRequests[0].title,
              status: activeRequests[0].status,
            },
          },
          { status: 400 }
        );
      }
    }
    
    const { qid, packageId, referralSource, stage, outreachProgram, projectType, specialRequirements } = body;

    // Handle both formats: questionnaire-based (qid) and form-based (packageId)
    if (qid) {
      // Original questionnaire-based flow
      const questionnaire = await prisma.questionnaire.findUnique({
        where: { id: qid },
      });

      if (!questionnaire) {
        return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
      }

      const data = questionnaire.data as any;
      const { totals, package: selectedPackage, selectedFeatures, questionnaire: answers } = data;

      // Update status to SUBMITTED
      await prisma.questionnaire.update({
        where: { id: qid },
        data: {
          data: {
            ...data,
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
          },
        },
      });

      // Create lead record linked to the user
      const lead = await prisma.lead.create({
        data: {
          name: user?.name || 'Unknown',
          email: user?.email || questionnaire.userEmail,
          phone: '', // Can be added to user profile later
          company: '', // Can be added to user profile later
          message: `Package: ${selectedPackage}\nFeatures: ${selectedFeatures?.length || 0} selected\nTotal: $${totals?.total || 0}\nTimeline: ${answers?.timeline || 'Not specified'}`,
          source: 'Questionnaire',
          status: LeadStatus.NEW,
          metadata: {
            qid,
            userId: user?.id,
            package: selectedPackage,
            features: selectedFeatures,
            totals,
            questionnaire: answers,
          },
        },
      });

      // Notify all admins about new lead
      const { createNewLeadNotification } = await import("@/lib/notifications");
      await createNewLeadNotification(
        lead.id,
        lead.name,
        lead.email,
        lead.company,
        lead.source || "Questionnaire"
      ).catch(err => console.error("Failed to create lead notification:", err));

      // Map projectType to ServiceType enum values
      const mapToServiceType = (type: string): string => {
        const mapping: Record<string, string> = {
          'Website': 'WEBSITE',
          'Web App': 'WEB_APP',
          'Mobile App': 'MOBILE',
          'Branding': 'BRANDING',
          'Dashboard': 'WEB_APP',
          'AI Integration': 'AI_DATA',
          'Other': 'OTHER',
        };
        return mapping[type] || 'OTHER';
      };

      const services = answers?.projectType 
        ? (Array.isArray(answers.projectType) 
            ? answers.projectType.map(mapToServiceType)
            : [mapToServiceType(answers.projectType)])
        : [];

      // Create ProjectRequest so it appears in client dashboard
      const projectRequest = await prisma.projectRequest.create({
        data: {
          userId: user?.id,
          title: `${selectedPackage} Package Request`,
          description: `Package: ${selectedPackage}\nFeatures: ${selectedFeatures?.length || 0} selected\nTotal: $${totals?.total || 0}\nTimeline: ${answers?.timeline || 'Not specified'}`,
          contactEmail: user?.email || questionnaire.userEmail,
          company: '',
          budget: BudgetTier.UNKNOWN, // Can be mapped from totals if needed
          timeline: answers?.timeline || null,
          services: services as any,
          status: 'SUBMITTED',
        },
      });

      return NextResponse.json({
        success: true,
        leadId: lead.id,
        projectRequestId: projectRequest.id,
      });
    } else if ((packageId || serviceType) && email && name) {
      // New form-based flow from ProjectRequestForm
      // Support both packageId (legacy) and serviceType (new)
      const selectedService = serviceType || packageId;

      // Ensure user exists at this point
      if (!user) {
        return NextResponse.json({ error: 'User account is required' }, { status: 401 });
      }

      // TypeScript now knows user is not null
      const currentUser = user;

      // 1. Find or create organization for the user
      let organization = await prisma.organization.findFirst({
        where: {
          members: {
            some: {
              userId: currentUser.id
            }
          }
        }
      });

      if (!organization) {
        // Create organization with email address
        const orgName = company || `${name}'s Organization`;
        const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
        
        organization = await prisma.organization.create({
          data: {
            name: orgName,
            slug: slug,
            email: email, // Set the organization email to match the lead/user
            phone: phone || null,
            members: {
              create: {
                userId: currentUser.id,
                role: 'OWNER'
              }
            }
          }
        });
      }

      // 2. Create lead record from form data
      // Ensure we have a valid name - use user's name as fallback if form name is empty
      const leadName = name?.trim() || currentUser.name || email?.split('@')[0] || 'Unknown Client';
      
      // Note: Duplicate check already performed at top of function
      
      // Use specialRequirements as the message - it's the freeform notes field
      // All structured data goes in metadata to avoid duplication
      const leadMessage = specialRequirements || projectGoals || '';
      
      const lead = await prisma.lead.create({
        data: {
          name: leadName,
          email: email,
          phone: phone || null,
          company: company || null,
          organizationId: organization.id, // Link to organization
          message: leadMessage,
          source: referralSource || 'Service Selection',
          status: LeadStatus.NEW,
          serviceType: selectedService, // ServiceCategory enum value (BUSINESS_WEBSITE, etc.)
          metadata: {
            userId: currentUser.id,
            budget: budget || null,
            timeline: timeline || urgency || null,
            projectGoals: projectGoals || null,
            specialRequirements: specialRequirements || null,
            nonprofitStatus: nonprofitStatus || null,
            nonprofitEIN: nonprofitEIN || null,
            // Maintenance-specific metadata
            maintenanceNeeds: maintenanceNeeds || null,
            maintenanceTier: maintenanceTier || null,
            urgency: urgency || null,
            websiteUrl: websiteUrl || null,
            websitePlatform: websitePlatform || null,
            hasAccessCredentials: hasAccessCredentials || null,
          },
        },
      });

      // Notify all admins about new lead
      const { createNewLeadNotification } = await import("@/lib/notifications");
      await createNewLeadNotification(
        lead.id,
        lead.name,
        lead.email,
        lead.company,
        lead.source || "Service Selection"
      ).catch(err => console.error("Failed to create lead notification:", err));

      // Map projectType to ServiceType enum values
      const mapToServiceType = (type: string): string => {
        const mapping: Record<string, string> = {
          'Website': 'WEBSITE',
          'Web App': 'WEB_APP',
          'Mobile App': 'MOBILE',
          'Branding': 'BRANDING',
          'Dashboard': 'WEB_APP',
          'AI Integration': 'AI_DATA',
          'Other': 'OTHER',
        };
        return mapping[type] || 'OTHER';
      };

      const services = projectType
        ? (Array.isArray(projectType)
            ? projectType.map(mapToServiceType)
            : [mapToServiceType(projectType)])
        : [];

      // Generate clean project title and description
      const isMaintenance = selectedService === 'MAINTENANCE_PLAN';
      const projectTitle = isMaintenance 
        ? `${name}'s Maintenance Plan`
        : `${name}'s Project`;
      
      const projectDescription = generateProjectDescription({
        serviceType: selectedService,
        projectGoals,
        maintenanceNeeds,
        urgency,
        websiteUrl,
        timeline,
      });

      // 3. Create ProjectRequest so it appears in client dashboard
      const projectRequest = await prisma.projectRequest.create({
        data: {
          userId: currentUser.id,
          name: leadName, // Set the name field to match the lead
          title: isMaintenance 
            ? `${leadName}'s Maintenance Plan Request` 
            : (projectGoals?.substring(0, 100) || `${leadName}'s ${getServiceDisplayName(selectedService)} Request`),
          description: projectDescription,
          contactEmail: email,
          company: company || null,
          budget: mapBudgetToTier(budget),
          timeline: timeline || urgency || null,
          services: services as any,
          status: 'SUBMITTED', // Keep as SUBMITTED - admin will approve later
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        },
      });

      // NOTE: Project is NOT created here anymore!
      // Projects are created when admin clicks "Approve & Create Project" via convertLeadToProject action
      // This keeps the flow clean: Lead (inquiry) → Admin Approval → Project (active work)

      // Send welcome email
      try {
        const emailResult = await sendWelcomeEmail({
          to: email,
          firstName: name.split(' ')[0], // Get first name
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client`,
        });
        console.log('Welcome email sent:', emailResult);
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error('Failed to send welcome email:', emailError);
      }

      return NextResponse.json({
        success: true,
        leadId: lead.id,
        projectRequestId: projectRequest.id,
        // No projectId returned - project created after admin approval
      });
    } else {
      return NextResponse.json(
        { error: 'Missing required fields: either qid or (serviceType/packageId, email, name)' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit lead' },
      { status: 500 }
    );
  }
}
