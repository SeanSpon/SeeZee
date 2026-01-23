"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { feedHelpers } from "@/lib/feed/emit";
import { ProjectStatus } from "@prisma/client";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN"];

// Milestone templates for auto-generation
const MILESTONE_TEMPLATES: Record<string, Array<{
  title: string;
  description: string;
  percentOfTimeline: number;
}>> = {
  WEBSITE: [
    { title: "Discovery & Planning", description: "Gather requirements, sitemap, wireframes", percentOfTimeline: 10 },
    { title: "Design Phase", description: "UI/UX design, mockups, client review", percentOfTimeline: 25 },
    { title: "Design Approval", description: "Final design sign-off from client", percentOfTimeline: 35 },
    { title: "Development Sprint 1", description: "Core pages, layout, navigation", percentOfTimeline: 50 },
    { title: "Development Sprint 2", description: "Features, forms, integrations", percentOfTimeline: 70 },
    { title: "Content Integration", description: "Add client content, images, copy", percentOfTimeline: 80 },
    { title: "Testing & QA", description: "Cross-browser, responsive, accessibility", percentOfTimeline: 90 },
    { title: "Launch", description: "Deploy to production, monitor", percentOfTimeline: 100 },
  ],
  WEB_APP: [
    { title: "Discovery & Requirements", description: "User stories, technical specs", percentOfTimeline: 10 },
    { title: "Architecture Planning", description: "System design, database schema", percentOfTimeline: 20 },
    { title: "UI/UX Design", description: "Wireframes, prototypes", percentOfTimeline: 30 },
    { title: "Backend Foundation", description: "Database, auth, core APIs", percentOfTimeline: 45 },
    { title: "Frontend Foundation", description: "Components, routing, state", percentOfTimeline: 55 },
    { title: "Feature Development", description: "Core features implementation", percentOfTimeline: 75 },
    { title: "Testing & QA", description: "Testing, bug fixes", percentOfTimeline: 90 },
    { title: "Launch", description: "Deploy, monitor, handoff", percentOfTimeline: 100 },
  ],
  DEFAULT: [
    { title: "Project Kickoff", description: "Planning and requirements", percentOfTimeline: 10 },
    { title: "Design Phase", description: "Visual design and review", percentOfTimeline: 30 },
    { title: "Development", description: "Build core functionality", percentOfTimeline: 60 },
    { title: "Review & Revisions", description: "Feedback and adjustments", percentOfTimeline: 80 },
    { title: "Testing & Launch", description: "QA and deployment", percentOfTimeline: 100 },
  ],
};

/**
 * Generate milestones for an existing project
 */
export async function generateProjectMilestones(
  projectId: string,
  options: {
    templateType?: string;
    startDate?: Date;
    endDate?: Date;
    clearExisting?: boolean;
  } = {}
) {
  const session = await auth();
  
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        lead: true,
        milestones: true,
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Clear existing milestones if requested
    if (options.clearExisting && project.milestones.length > 0) {
      await prisma.projectMilestone.deleteMany({
        where: { projectId },
      });
    }

    // Determine template
    const templateKey = options.templateType || 
      (project.lead?.serviceType as string) ||
      "DEFAULT";
    const template = MILESTONE_TEMPLATES[templateKey] || MILESTONE_TEMPLATES.DEFAULT;

    // Calculate dates
    const startDate = options.startDate || project.startDate || new Date();
    const endDate = options.endDate || project.endDate || 
      new Date(startDate.getTime() + 56 * 24 * 60 * 60 * 1000); // 8 weeks default
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Create milestones
    const milestones = template.map((m, index) => {
      const dueDate = new Date(startDate);
      const daysOffset = Math.round((totalDays * m.percentOfTimeline) / 100);
      dueDate.setDate(dueDate.getDate() + daysOffset);
      
      return {
        title: m.title,
        description: m.description,
        dueDate,
        projectId,
        completed: false,
      };
    });

    await prisma.projectMilestone.createMany({
      data: milestones,
    });

    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/client/projects/${projectId}`);

    return { 
      success: true, 
      milestonesCreated: milestones.length,
    };
  } catch (error) {
    console.error("[Generate Milestones Error]", error);
    return { success: false, error: "Failed to generate milestones" };
  }
}

/**
 * Update project Git/Vercel integrations
 */
export async function updateProjectIntegrations(
  projectId: string,
  data: {
    githubRepo?: string | null;
    vercelUrl?: string | null;
    vercelProjectId?: string | null;
    vercelTeamId?: string | null;
  }
) {
  const session = await auth();
  
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        githubRepo: data.githubRepo !== undefined ? data.githubRepo : undefined,
        vercelUrl: data.vercelUrl !== undefined ? data.vercelUrl : undefined,
        vercelProjectId: data.vercelProjectId !== undefined ? data.vercelProjectId : undefined,
        vercelTeamId: data.vercelTeamId !== undefined ? data.vercelTeamId : undefined,
      },
      select: {
        id: true,
        name: true,
        githubRepo: true,
        vercelUrl: true,
        vercelProjectId: true,
      },
    });

    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/client/projects/${projectId}`);

    return { success: true, project };
  } catch (error) {
    console.error("[Update Integrations Error]", error);
    return { success: false, error: "Failed to update integrations" };
  }
}

/**
 * Update project timeline and dates
 */
export async function updateProjectTimeline(
  projectId: string,
  data: {
    startDate?: Date | string;
    endDate?: Date | string;
    rescaleMilestones?: boolean;
  }
) {
  const session = await auth();
  
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { milestones: { orderBy: { dueDate: "asc" } } },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    const startDate = data.startDate ? new Date(data.startDate) : project.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : project.endDate;

    // Update project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        startDate,
        endDate,
      },
    });

    // Rescale milestones if requested
    if (data.rescaleMilestones && startDate && endDate && project.milestones.length > 0) {
      const oldStart = project.startDate || project.createdAt;
      const oldEnd = project.endDate || new Date(oldStart.getTime() + 56 * 24 * 60 * 60 * 1000);
      const oldTotalMs = oldEnd.getTime() - oldStart.getTime();
      const newTotalMs = endDate.getTime() - startDate.getTime();

      for (const milestone of project.milestones) {
        if (!milestone.dueDate) continue;
        
        // Calculate relative position (0-1)
        const relativePosition = (milestone.dueDate.getTime() - oldStart.getTime()) / oldTotalMs;
        
        // Apply to new timeline
        const newDueDate = new Date(startDate.getTime() + relativePosition * newTotalMs);
        
        await prisma.projectMilestone.update({
          where: { id: milestone.id },
          data: { dueDate: newDueDate },
        });
      }
    }

    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/client/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    console.error("[Update Timeline Error]", error);
    return { success: false, error: "Failed to update timeline" };
  }
}

/**
 * Update project status and stage
 */
export async function updateProjectStatus(
  projectId: string,
  data: {
    status?: ProjectStatus;
    currentStage?: string;
    progress?: number;
  }
) {
  const session = await auth();
  
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updateData: any = {};
    
    if (data.status) updateData.status = data.status;
    if (data.currentStage) updateData.currentStage = data.currentStage;
    if (typeof data.progress === "number") {
      updateData.progress = Math.max(0, Math.min(100, data.progress));
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      select: {
        id: true,
        name: true,
        status: true,
        currentStage: true,
        progress: true,
      },
    });

    // Emit feed event for status change
    if (data.status) {
      await feedHelpers.projectUpdated(projectId, project.name);
    }

    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/client/projects/${projectId}`);
    revalidatePath("/admin/projects");
    revalidatePath("/client");

    return { success: true, project };
  } catch (error) {
    console.error("[Update Status Error]", error);
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * Complete a milestone
 */
export async function completeMilestone(milestoneId: string) {
  const session = await auth();
  
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const milestone = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        completed: true,
        completedAt: new Date(),
      },
      include: {
        project: {
          include: {
            milestones: true,
          },
        },
      },
    });

    // Auto-update project progress
    const totalMilestones = milestone.project.milestones.length;
    const completedMilestones = milestone.project.milestones.filter(m => m.completed).length;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    await prisma.project.update({
      where: { id: milestone.projectId },
      data: { progress },
    });

    // Emit feed event
    await feedHelpers.milestoneCompleted(milestone.projectId, milestone.title);

    revalidatePath(`/admin/projects/${milestone.projectId}`);
    revalidatePath(`/client/projects/${milestone.projectId}`);

    return { success: true, progress };
  } catch (error) {
    console.error("[Complete Milestone Error]", error);
    return { success: false, error: "Failed to complete milestone" };
  }
}

/**
 * Add a single milestone to a project
 */
export async function addMilestone(
  projectId: string,
  data: {
    title: string;
    description?: string;
    dueDate?: Date | string;
  }
) {
  const session = await auth();
  
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        completed: false,
      },
    });

    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/client/projects/${projectId}`);

    return { success: true, milestone };
  } catch (error) {
    console.error("[Add Milestone Error]", error);
    return { success: false, error: "Failed to add milestone" };
  }
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(milestoneId: string) {
  const session = await auth();
  
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const milestone = await prisma.projectMilestone.delete({
      where: { id: milestoneId },
    });

    revalidatePath(`/admin/projects/${milestone.projectId}`);
    revalidatePath(`/client/projects/${milestone.projectId}`);

    return { success: true };
  } catch (error) {
    console.error("[Delete Milestone Error]", error);
    return { success: false, error: "Failed to delete milestone" };
  }
}
