"use server";

/**
 * Server actions for Pipeline management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/permissions";
import { revalidateTag } from "next/cache";
import { tags } from "@/lib/tags";
import { logActivity } from "./activity";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "CONVERTED"
  | "LOST";

/**
 * Get all leads organized by pipeline stage
 */
export async function getPipeline() {
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

  try {
    const leads = await db.lead.findMany({
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by status
    const pipeline = {
      NEW: leads.filter((l) => l.status === "NEW"),
      CONTACTED: leads.filter((l) => l.status === "CONTACTED"),
      QUALIFIED: leads.filter((l) => l.status === "QUALIFIED"),
      PROPOSAL_SENT: leads.filter((l) => l.status === "PROPOSAL_SENT"),
      CONVERTED: leads.filter((l) => l.status === "CONVERTED"),
      LOST: leads.filter((l) => l.status === "LOST"),
    };

    return { success: true, pipeline, leads };
  } catch (error) {
    console.error("Failed to fetch pipeline:", error);
    return { success: false, error: "Failed to fetch pipeline", pipeline: null, leads: [] };
  }
}

/**
 * Update lead status (move in pipeline)
 */
export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
  const user = await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF]);

  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    const oldStatus = lead.status;

    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: {
        status: newStatus,
        ...(newStatus === "CONVERTED" && { convertedAt: new Date() }),
      },
    });

    // Create activity log
    await createActivity({
      type: "LEAD_UPDATED",
      title: `Lead moved from ${oldStatus} to ${newStatus}`,
      description: `${lead.name} (${lead.email})`,
      userId: user.id,
      entityType: "Lead",
      entityId: leadId,
      metadata: {
        oldStatus,
        newStatus,
        leadName: lead.name,
      },
    });

    revalidatePath("/admin/pipeline");
    return { success: true, lead: updatedLead };
  } catch (error) {
    console.error("Failed to update lead status:", error);
    return { success: false, error: "Failed to update lead status" };
  }
}

/**
 * Get single lead details
 */
export async function getLeadDetails(leadId: string) {
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        organization: true,
        project: true,
      },
    });

    if (!lead) {
      return { success: false, error: "Lead not found", lead: null };
    }

    return { success: true, lead };
  } catch (error) {
    console.error("Failed to fetch lead details:", error);
    return { success: false, error: "Failed to fetch lead details", lead: null };
  }
}

/**
 * Add notes to a lead
 */
export async function updateLeadNotes(leadId: string, notes: string) {
  const user = await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF]);

  try {
    const lead = await db.lead.update({
      where: { id: leadId },
      data: {
        message: notes, // Storing in message field for now
      },
    });

    revalidatePath("/admin/pipeline");
    return { success: true, lead };
  } catch (error) {
    console.error("Failed to update lead notes:", error);
    return { success: false, error: "Failed to update lead notes" };
  }
}
