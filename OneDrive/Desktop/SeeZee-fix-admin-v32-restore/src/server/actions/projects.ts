"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { emitFeedEvent } from "@/lib/feed";
import { ProjectStatus } from "@prisma/client";

interface ApproveLeadInput {
  leadId: string;
  projectName?: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  assigneeId?: string;
}

/**
 * CEO Action: Approve a lead and create a project
 * This is the gateway from lead → project workflow
 */
export async function approveLead(input: ApproveLeadInput) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CEO") {
    throw new Error("Unauthorized: CEO role required");
  }

  const { leadId, projectName, budget, startDate, endDate, assigneeId } = input;

  try {
    // Fetch the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { organization: true },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    if (lead.status === "CONVERTED") {
      throw new Error("Lead already converted to project");
    }

    // Create project from lead
    const project = await prisma.project.create({
      data: {
        name: projectName || `${lead.company || lead.name} Project`,
        description: typeof lead.requirements === 'string' ? lead.requirements : (lead.message || ""),
        status: "PLANNING" as ProjectStatus, // Use string literal until Prisma client regenerates
        organizationId: lead.organizationId || "",
        leadId: lead.id,
        budget: budget ? budget.toString() : (typeof lead.budget === 'string' ? lead.budget : null),
        startDate: startDate || new Date(),
        endDate: endDate || null,
        assigneeId: assigneeId || null,
      },
    });

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
      },
    });

    // Emit feed events
    await emitFeedEvent(project.id, "lead.created", {
      leadId: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
    });

    await emitFeedEvent(project.id, "project.created", {
      name: project.name,
      status: project.status,
      createdBy: session.user.name,
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin/pipeline");
    revalidatePath("/admin/projects");

    return { success: true, project };
  } catch (error) {
    console.error("[approveLead] Error:", error);
    throw error;
  }
}

/**
 * Update project status and emit feed event
 */
export async function updateProjectStatus(projectId: string, newStatus: ProjectStatus) {
  const session = await auth();

  if (!session?.user || !["CEO", "ADMIN"].includes(session.user.role || "")) {
    throw new Error("Unauthorized");
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const oldStatus = project.status;

    await prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus },
    });

    // Emit status change event
    await emitFeedEvent(projectId, "status.changed", {
      from: oldStatus,
      to: newStatus,
      by: session.user.name,
      timestamp: new Date().toISOString(),
    });

    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/client/projects/${projectId}`);
    revalidatePath("/admin/pipeline");

    return { success: true };
  } catch (error) {
    console.error("[updateProjectStatus] Error:", error);
    throw error;
  }
}

/**
 * Complete a milestone and emit feed event
 * NOTE: Requires Milestone model in schema - currently commented out
 */
export async function completeMilestone(milestoneId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // TODO: Uncomment when Milestone model is added to schema
    /*
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        completed: true,
        completedAt: new Date(),
      },
      include: {
        project: { select: { id: true } },
      },
    });

    await emitFeedEvent(milestone.project.id, "milestone.completed", {
      milestoneId: milestone.id,
      title: milestone.title,
      description: milestone.description,
      completedBy: session.user.name,
    });

    revalidatePath(`/admin/projects/${milestone.project.id}`);
    revalidatePath(`/client/projects/${milestone.project.id}`);

    return { success: true };
    */
    
    throw new Error("Milestone model not yet implemented in schema");
  } catch (error) {
    console.error("[completeMilestone] Error:", error);
    throw error;
  }
}
