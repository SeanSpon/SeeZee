import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectStatus, ServiceType, ServiceCategory } from "@prisma/client";
import { feedHelpers } from "@/lib/feed/emit";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN"];

// Milestone templates based on project type
const MILESTONE_TEMPLATES: Record<string, Array<{
  title: string;
  description: string;
  daysFromStart: number;
  percentOfTimeline: number;
}>> = {
  WEBSITE: [
    { title: "Discovery & Planning", description: "Gather requirements, sitemap, wireframes", daysFromStart: 0, percentOfTimeline: 10 },
    { title: "Design Phase", description: "UI/UX design, mockups, client review", daysFromStart: 7, percentOfTimeline: 25 },
    { title: "Design Approval", description: "Final design sign-off from client", daysFromStart: 14, percentOfTimeline: 35 },
    { title: "Development Sprint 1", description: "Core pages, layout, navigation", daysFromStart: 21, percentOfTimeline: 50 },
    { title: "Development Sprint 2", description: "Features, forms, integrations", daysFromStart: 35, percentOfTimeline: 70 },
    { title: "Content Integration", description: "Add client content, images, copy", daysFromStart: 42, percentOfTimeline: 80 },
    { title: "Testing & QA", description: "Cross-browser, responsive, accessibility", daysFromStart: 49, percentOfTimeline: 90 },
    { title: "Launch Prep", description: "DNS, hosting, final checks", daysFromStart: 54, percentOfTimeline: 95 },
    { title: "Go Live", description: "Deploy to production, monitor", daysFromStart: 56, percentOfTimeline: 100 },
  ],
  WEB_APP: [
    { title: "Discovery & Requirements", description: "User stories, technical specs", daysFromStart: 0, percentOfTimeline: 5 },
    { title: "Architecture Planning", description: "System design, database schema, API structure", daysFromStart: 7, percentOfTimeline: 10 },
    { title: "UI/UX Design", description: "Wireframes, prototypes, user flows", daysFromStart: 14, percentOfTimeline: 20 },
    { title: "Design Review", description: "Client feedback and approval", daysFromStart: 21, percentOfTimeline: 25 },
    { title: "Backend Foundation", description: "Database, authentication, core APIs", daysFromStart: 28, percentOfTimeline: 35 },
    { title: "Frontend Foundation", description: "Component library, routing, state", daysFromStart: 35, percentOfTimeline: 45 },
    { title: "Feature Development 1", description: "Core features implementation", daysFromStart: 49, percentOfTimeline: 60 },
    { title: "Feature Development 2", description: "Secondary features, integrations", daysFromStart: 63, percentOfTimeline: 75 },
    { title: "Alpha Testing", description: "Internal testing, bug fixes", daysFromStart: 77, percentOfTimeline: 85 },
    { title: "Beta Testing", description: "User acceptance testing", daysFromStart: 84, percentOfTimeline: 92 },
    { title: "Launch Preparation", description: "Performance optimization, security audit", daysFromStart: 91, percentOfTimeline: 97 },
    { title: "Production Launch", description: "Deploy, monitor, handoff", daysFromStart: 98, percentOfTimeline: 100 },
  ],
  ECOMMERCE: [
    { title: "Discovery & Product Analysis", description: "Catalog structure, payment requirements", daysFromStart: 0, percentOfTimeline: 8 },
    { title: "Platform Architecture", description: "Ecommerce platform selection, integrations planning", daysFromStart: 7, percentOfTimeline: 15 },
    { title: "Design Phase", description: "Store design, product pages, checkout flow", daysFromStart: 14, percentOfTimeline: 25 },
    { title: "Design Approval", description: "Final design sign-off", daysFromStart: 21, percentOfTimeline: 30 },
    { title: "Store Development", description: "Theme, product catalog, categories", daysFromStart: 28, percentOfTimeline: 45 },
    { title: "Payment & Shipping", description: "Payment gateway, shipping integration", daysFromStart: 42, percentOfTimeline: 60 },
    { title: "Product Upload", description: "Product data, images, descriptions", daysFromStart: 49, percentOfTimeline: 70 },
    { title: "Testing & QA", description: "Test orders, edge cases, mobile", daysFromStart: 56, percentOfTimeline: 85 },
    { title: "SEO & Analytics", description: "SEO setup, tracking, reporting", daysFromStart: 63, percentOfTimeline: 92 },
    { title: "Soft Launch", description: "Limited release, monitoring", daysFromStart: 67, percentOfTimeline: 96 },
    { title: "Full Launch", description: "Public launch, marketing integration", daysFromStart: 70, percentOfTimeline: 100 },
  ],
  BRANDING: [
    { title: "Brand Discovery", description: "Questionnaire, competitor analysis, mood boards", daysFromStart: 0, percentOfTimeline: 15 },
    { title: "Concept Development", description: "Initial logo concepts, color palettes", daysFromStart: 7, percentOfTimeline: 35 },
    { title: "Concept Review", description: "Client feedback, direction selection", daysFromStart: 14, percentOfTimeline: 45 },
    { title: "Design Refinement", description: "Refine selected concept", daysFromStart: 21, percentOfTimeline: 65 },
    { title: "Brand Assets", description: "Logo variations, typography, icons", daysFromStart: 28, percentOfTimeline: 80 },
    { title: "Brand Guidelines", description: "Style guide document", daysFromStart: 35, percentOfTimeline: 95 },
    { title: "Final Delivery", description: "All files, formats, handoff", daysFromStart: 42, percentOfTimeline: 100 },
  ],
  MOBILE: [
    { title: "Discovery & Planning", description: "App requirements, platform selection", daysFromStart: 0, percentOfTimeline: 8 },
    { title: "UX Research", description: "User flows, competitive analysis", daysFromStart: 7, percentOfTimeline: 15 },
    { title: "UI Design", description: "App screens, component library", daysFromStart: 14, percentOfTimeline: 25 },
    { title: "Design Review", description: "Client feedback and approval", daysFromStart: 21, percentOfTimeline: 30 },
    { title: "App Architecture", description: "Technical foundation, APIs", daysFromStart: 28, percentOfTimeline: 40 },
    { title: "Core Development", description: "Main features implementation", daysFromStart: 42, percentOfTimeline: 55 },
    { title: "Feature Development", description: "Secondary features, polish", daysFromStart: 63, percentOfTimeline: 70 },
    { title: "Integration", description: "Backend APIs, third-party services", daysFromStart: 77, percentOfTimeline: 80 },
    { title: "Testing", description: "Device testing, performance", daysFromStart: 84, percentOfTimeline: 90 },
    { title: "App Store Prep", description: "Screenshots, descriptions, submission", daysFromStart: 91, percentOfTimeline: 97 },
    { title: "Launch", description: "App store release, monitoring", daysFromStart: 98, percentOfTimeline: 100 },
  ],
  DEFAULT: [
    { title: "Project Kickoff", description: "Initial planning and requirements gathering", daysFromStart: 0, percentOfTimeline: 10 },
    { title: "Design Phase", description: "Visual design and client review", daysFromStart: 7, percentOfTimeline: 30 },
    { title: "Development", description: "Build core functionality", daysFromStart: 21, percentOfTimeline: 60 },
    { title: "Review & Revisions", description: "Client feedback and adjustments", daysFromStart: 35, percentOfTimeline: 80 },
    { title: "Testing & QA", description: "Quality assurance and bug fixes", daysFromStart: 42, percentOfTimeline: 90 },
    { title: "Launch", description: "Deploy and handoff", daysFromStart: 49, percentOfTimeline: 100 },
  ],
};

// Parse timeline string to days
function parseTimelineToDays(timeline: string | null): number {
  if (!timeline) return 56; // Default 8 weeks
  
  const lower = timeline.toLowerCase();
  
  if (lower.includes("rush") || lower.includes("asap") || lower.includes("urgent")) {
    return 21; // 3 weeks
  }
  if (lower.includes("1 week") || lower.includes("one week")) {
    return 7;
  }
  if (lower.includes("2 week") || lower.includes("two week")) {
    return 14;
  }
  if (lower.includes("3 week") || lower.includes("three week")) {
    return 21;
  }
  if (lower.includes("1 month") || lower.includes("one month") || lower.includes("4 week")) {
    return 28;
  }
  if (lower.includes("6 week")) {
    return 42;
  }
  if (lower.includes("2 month") || lower.includes("two month") || lower.includes("8 week")) {
    return 56;
  }
  if (lower.includes("3 month") || lower.includes("three month") || lower.includes("12 week")) {
    return 84;
  }
  if (lower.includes("4 month") || lower.includes("four month")) {
    return 112;
  }
  if (lower.includes("6 month") || lower.includes("six month")) {
    return 168;
  }
  if (lower.includes("flexible") || lower.includes("standard")) {
    return 56; // 8 weeks
  }
  if (lower.includes("extended")) {
    return 84; // 12 weeks
  }
  
  return 56; // Default 8 weeks
}

// Map service types to milestone template keys
function getTemplateKey(serviceType: string | null, serviceCategory: string | null): string {
  if (serviceType === "WEB_APP" || serviceType === "AI_DATA") return "WEB_APP";
  if (serviceType === "ECOMMERCE") return "ECOMMERCE";
  if (serviceType === "MOBILE") return "MOBILE";
  if (serviceType === "BRANDING") return "BRANDING";
  if (serviceType === "WEBSITE") return "WEBSITE";
  
  if (serviceCategory === "BUSINESS_WEBSITE" || serviceCategory === "NONPROFIT_WEBSITE" || serviceCategory === "PERSONAL_WEBSITE") {
    return "WEBSITE";
  }
  
  return "DEFAULT";
}

interface CreateProjectInput {
  leadId: string;
  name?: string;
  description?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  timeline?: string;
  githubRepo?: string;
  vercelProjectId?: string;
  assigneeId?: string;
  generateMilestones?: boolean;
  customMilestones?: Array<{
    title: string;
    description?: string;
    dueDate?: string;
  }>;
}

/**
 * POST /api/admin/projects/create-from-lead
 * Create a full project from a lead with auto-generated milestones
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "CEO/CFO/Admin role required" }, { status: 403 });
    }

    const body: CreateProjectInput = await req.json();
    const { 
      leadId, 
      name, 
      description, 
      budget, 
      startDate, 
      endDate, 
      timeline,
      githubRepo, 
      vercelProjectId, 
      assigneeId,
      generateMilestones = true,
      customMilestones,
    } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { organization: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check if project already exists
    const existingProject = await prisma.project.findFirst({
      where: { leadId },
    });

    if (existingProject) {
      return NextResponse.json({ 
        error: "Project already exists for this lead",
        projectId: existingProject.id 
      }, { status: 409 });
    }

    // Create or get organization
    let orgId = lead.organizationId;
    if (!orgId) {
      if (!lead.email) {
        return NextResponse.json({ 
          error: "Cannot create organization: Lead has no email" 
        }, { status: 400 });
      }

      const orgName = lead.company || `${lead.name}'s Organization`;
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const organization = await prisma.organization.create({
        data: {
          name: orgName,
          slug: `${slug}-${Date.now()}`,
          email: lead.email,
          phone: lead.phone,
        },
      });
      
      orgId = organization.id;
    }

    // Calculate dates
    const projectStartDate = startDate ? new Date(startDate) : new Date();
    const timelineDays = parseTimelineToDays(timeline || lead.timeline);
    const projectEndDate = endDate 
      ? new Date(endDate) 
      : new Date(projectStartDate.getTime() + timelineDays * 24 * 60 * 60 * 1000);

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: name || lead.company || `Project for ${lead.name}`,
        description: description || lead.message || `${lead.serviceType || "Web"} project`,
        status: ProjectStatus.QUOTED,
        organizationId: orgId,
        leadId: lead.id,
        budget: budget ? budget : null,
        startDate: projectStartDate,
        endDate: projectEndDate,
        githubRepo: githubRepo || null,
        vercelProjectId: vercelProjectId || null,
        assigneeId: assigneeId || null,
        currentStage: "DISCOVERY",
        progress: 0,
      },
    });

    // Generate milestones
    const milestones: Array<{
      title: string;
      description: string | null;
      dueDate: Date;
      projectId: string;
    }> = [];

    if (customMilestones && customMilestones.length > 0) {
      // Use custom milestones
      for (const m of customMilestones) {
        milestones.push({
          title: m.title,
          description: m.description || null,
          dueDate: m.dueDate ? new Date(m.dueDate) : projectEndDate,
          projectId: project.id,
        });
      }
    } else if (generateMilestones) {
      // Auto-generate based on project type
      const templateKey = getTemplateKey(
        lead.serviceType as string | null, 
        null
      );
      const template = MILESTONE_TEMPLATES[templateKey] || MILESTONE_TEMPLATES.DEFAULT;

      for (const milestone of template) {
        const dueDate = new Date(projectStartDate);
        // Scale milestone dates based on timeline
        const scaledDays = Math.round((timelineDays * milestone.percentOfTimeline) / 100);
        dueDate.setDate(dueDate.getDate() + scaledDays);
        
        milestones.push({
          title: milestone.title,
          description: milestone.description,
          dueDate,
          projectId: project.id,
        });
      }
    }

    // Create milestones in database
    if (milestones.length > 0) {
      await prisma.projectMilestone.createMany({
        data: milestones,
      });
    }

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
        organizationId: orgId,
      },
    });

    // Create or link user to organization
    if (lead.email) {
      let user = await prisma.user.findUnique({
        where: { email: lead.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: lead.email,
            name: lead.name,
            role: "CLIENT",
          },
        });
      }

      // Check if already a member
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: user.id,
          },
        },
      });

      if (!existingMember) {
        await prisma.organizationMember.create({
          data: {
            organizationId: orgId,
            userId: user.id,
            role: "OWNER",
          },
        });
      }
    }

    // Emit feed event
    await feedHelpers.projectCreated(project.id, project.name);

    // Fetch the complete project with milestones
    const completeProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        organization: true,
        milestones: {
          orderBy: { dueDate: "asc" },
        },
        lead: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      project: completeProject,
      milestonesCreated: milestones.length,
    });
  } catch (error) {
    console.error("[POST /api/admin/projects/create-from-lead]", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/projects/create-from-lead
 * Get milestone templates preview
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const serviceType = searchParams.get("serviceType");
    const timeline = searchParams.get("timeline");
    const startDate = searchParams.get("startDate");

    const templateKey = getTemplateKey(serviceType, null);
    const template = MILESTONE_TEMPLATES[templateKey] || MILESTONE_TEMPLATES.DEFAULT;
    const timelineDays = parseTimelineToDays(timeline);
    const start = startDate ? new Date(startDate) : new Date();

    const previewMilestones = template.map(m => {
      const dueDate = new Date(start);
      const scaledDays = Math.round((timelineDays * m.percentOfTimeline) / 100);
      dueDate.setDate(dueDate.getDate() + scaledDays);
      
      return {
        title: m.title,
        description: m.description,
        dueDate: dueDate.toISOString(),
        percentOfTimeline: m.percentOfTimeline,
      };
    });

    return NextResponse.json({
      templateKey,
      timelineDays,
      startDate: start.toISOString(),
      endDate: new Date(start.getTime() + timelineDays * 24 * 60 * 60 * 1000).toISOString(),
      milestones: previewMilestones,
    });
  } catch (error) {
    console.error("[GET /api/admin/projects/create-from-lead]", error);
    return NextResponse.json(
      { error: "Failed to get milestone preview" },
      { status: 500 }
    );
  }
}
