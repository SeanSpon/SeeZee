import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

import { LeadStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - please sign in' }, { status: 401 });
    }

    const body = await req.json();
    
    // Check for active project requests - limit to 1 submission
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for active project requests
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
    const { qid, packageId, email, name, phone, company, referralSource, stage, outreachProgram, projectType, projectGoals, timeline, specialRequirements } = body;

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
          name: user.name || 'Unknown',
          email: user.email!,
          phone: '', // Can be added to user profile later
          company: '', // Can be added to user profile later
          message: `Package: ${selectedPackage}\nFeatures: ${selectedFeatures?.length || 0} selected\nTotal: $${totals?.total || 0}\nTimeline: ${answers?.timeline || 'Not specified'}`,
          source: 'Questionnaire',
          status: LeadStatus.NEW,
          metadata: {
            qid,
            userId: user.id,
            package: selectedPackage,
            features: selectedFeatures,
            totals,
            questionnaire: answers,
          },
        },
      });

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
          userId: user.id,
          title: `${selectedPackage} Package Request`,
          description: `Package: ${selectedPackage}\nFeatures: ${selectedFeatures?.length || 0} selected\nTotal: $${totals?.total || 0}\nTimeline: ${answers?.timeline || 'Not specified'}`,
          contactEmail: user.email!,
          company: '',
          budget: 'UNKNOWN', // Can be mapped from totals if needed
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
    } else if (packageId && email && name) {
      // New form-based flow from ProjectRequestForm

      // Create lead record from form data
      const lead = await prisma.lead.create({
        data: {
          name: name,
          email: email,
          phone: phone || null,
          company: company || null,
          message: `Project Goals: ${projectGoals || 'Not specified'}\n\nTimeline: ${timeline || 'Not specified'}\n\nSpecial Requirements: ${specialRequirements || 'None'}`,
          source: referralSource || 'Package Selection',
          status: LeadStatus.NEW,
          serviceType: packageId.toUpperCase(),
          metadata: {
            userId: user.id,
            package: packageId,
            referralSource: referralSource || null,
            stage: stage || null,
            outreachProgram: outreachProgram || null,
            projectType: projectType || null,
            projectGoals: projectGoals || null,
            timeline: timeline || null,
            specialRequirements: specialRequirements || null,
          },
        },
      });

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

      // Create ProjectRequest so it appears in client dashboard
      const projectRequest = await prisma.projectRequest.create({
        data: {
          userId: user.id,
          title: projectGoals || `${packageId} Package Request`,
          description: `Project Goals: ${projectGoals || 'Not specified'}\n\nTimeline: ${timeline || 'Not specified'}\n\nSpecial Requirements: ${specialRequirements || 'None'}`,
          contactEmail: email,
          company: company || null,
          budget: 'UNKNOWN',
          timeline: timeline || null,
          services: services as any,
          status: 'SUBMITTED',
        },
      });

      return NextResponse.json({
        success: true,
        leadId: lead.id,
        projectRequestId: projectRequest.id,
      });
    } else {
      return NextResponse.json(
        { error: 'Missing required fields: either qid or (packageId, email, name)' },
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
