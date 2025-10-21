"use server";

/**
 * Server actions for Pipeline management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/permissions";
import { revalidateTag } from "next/cache";
import { tags } from "@/lib/tags";
import { logActivity } from "./activity";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "CONVERTED"
  | "LOST";

// Helper function to create activity
async function createActivity(data: any) {
  return await logActivity({
    type: data.type,
    title: data.title,
    description: data.description,
    userId: data.userId,
    metadata: data.metadata,
  });
}

/**
 * Get all leads organized by pipeline stage
 */
export async function getPipeline() {
  await requireRole("STAFF");

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
  const user = await requireRole("STAFF");

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
  await requireRole("STAFF");

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
  const user = await requireRole("STAFF");

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

/**
 * Convert lead to project
 */
export async function convertLeadToProject(leadId: string) {
  const user = await requireRole("STAFF");

  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { organization: true },
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    if (lead.status === "CONVERTED") {
      return { success: false, error: "Lead already converted" };
    }

    // Create or get organization
    let orgId = lead.organizationId;
    if (!orgId && lead.company) {
      const org = await db.organization.create({
        data: {
          name: lead.company,
          email: lead.email,
          phone: lead.phone,
          slug: lead.company.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
      });
      orgId = org.id;
    }

    if (!orgId) {
      return { success: false, error: "No organization associated with lead" };
    }

    // Create project
    const project = await db.project.create({
      data: {
        name: lead.name || `${lead.company} Project`,
        description: lead.message || "",
        status: "LEAD",
        organizationId: orgId,
        leadId: leadId,
        assigneeId: user.id,
        budget: lead.budget ? parseFloat(lead.budget) : null,
      },
    });

    // Update lead status
    await db.lead.update({
      where: { id: leadId },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
      },
    });

    // Create activity log
    await createActivity({
      type: "PROJECT_CREATED",
      title: `Lead converted to project`,
      description: `${lead.name} → ${project.name}`,
      userId: user.id,
      metadata: {
        leadId,
        projectId: project.id,
        leadName: lead.name,
        projectName: project.name,
      },
    });

    revalidatePath("/admin/pipeline");
    return { success: true, project };
  } catch (error) {
    console.error("Failed to convert lead to project:", error);
    return { success: false, error: "Failed to convert lead to project" };
  }
}

/**
 * Get all projects
 */
export async function getProjects() {
  await requireRole("STAFF");

  try {
    const projects = await db.project.findMany({
      include: {
        organization: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        lead: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, projects };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return { success: false, error: "Failed to fetch projects", projects: [] };
  }
}

/**
 * Create invoice from project
 */
export async function createInvoiceFromProject(projectId: string, data: {
  title: string;
  description?: string;
  amount: number;
  dueDate: Date;
}) {
  const user = await requireRole("STAFF");

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Generate invoice number
    const invoiceCount = await db.invoice.count();
    const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`;

    const invoice = await db.invoice.create({
      data: {
        number: invoiceNumber,
        title: data.title,
        description: data.description,
        amount: data.amount,
        tax: data.amount * 0.0, // Add tax calculation if needed
        total: data.amount,
        status: "DRAFT",
        dueDate: data.dueDate,
        organizationId: project.organizationId,
        projectId: projectId,
      },
    });

    // Create activity log
    await createActivity({
      type: "INVOICE_PAID",
      title: `Invoice created for ${project.name}`,
      description: `${invoiceNumber} - $${data.amount}`,
      userId: user.id,
      metadata: {
        invoiceId: invoice.id,
        projectId,
        amount: data.amount,
      },
    });

    revalidatePath("/admin/pipeline");
    return { success: true, invoice };
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

/**
 * Get all invoices
 */
export async function getInvoices() {
  await requireRole("STAFF");

  try {
    const invoices = await db.invoice.findMany({
      include: {
        organization: true,
        project: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, invoices };
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return { success: false, error: "Failed to fetch invoices", invoices: [] };
  }
}
