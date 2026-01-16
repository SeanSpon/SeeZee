"use server";

/**
 * Server actions for Client/Organization management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

/**
 * Get all clients/organizations with their projects and invoices
 */
export async function getClients() {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const organizations = await db.organization.findMany({
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        invoices: {
          select: {
            id: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Serialize decimal fields
    const serializedOrgs = organizations.map((org) => ({
      ...org,
      invoices: org.invoices.map((inv) => ({
        ...inv,
        total: Number(inv.total),
      })),
    }));

    return { success: true, clients: serializedOrgs };
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return { success: false, error: "Failed to fetch clients", clients: [] };
  }
}

/**
 * Create a new client/organization
 */
export async function createClient(data: {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    // Generate unique slug
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now()}`;

    const client = await db.organization.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        slug,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zip,
        country: data.country,
      },
    });

    await logActivity({
      type: "USER_JOINED",
      title: `Client created`,
      description: `${client.name}`,
      userId: user.id,
      metadata: {
        clientId: client.id,
        clientName: client.name,
      },
    });

    revalidatePath("/admin/clients");
    return { success: true, client };
  } catch (error) {
    console.error("Failed to create client:", error);
    return { success: false, error: "Failed to create client" };
  }
}

/**
 * Update a client/organization
 */
export async function updateClient(
  clientId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }
) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const client = await db.organization.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    const updatedClient = await db.organization.update({
      where: { id: clientId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.zip !== undefined && { zipCode: data.zip }),
        ...(data.country !== undefined && { country: data.country }),
      },
    });

    await logActivity({
      type: "SYSTEM_ALERT",
      title: `Client updated`,
      description: `${updatedClient.name}`,
      userId: user.id,
      metadata: {
        clientId,
        changes: data,
      },
    });

    revalidatePath("/admin/clients");
    return { success: true, client: updatedClient };
  } catch (error) {
    console.error("Failed to update client:", error);
    return { success: false, error: "Failed to update client" };
  }
}

/**
 * Delete a client/organization
 */
export async function deleteClient(clientId: string) {
  const user = await requireRole([ROLE.CEO]);

  try {
    const client = await db.organization.findUnique({
      where: { id: clientId },
      include: {
        projects: true,
        invoices: true,
        members: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // Check if client has active projects
    const activeProjects = client.projects.filter((p) =>
      ["IN_PROGRESS", "ACTIVE", "DESIGN", "BUILD", "REVIEW", "LEAD"].includes(p.status)
    );
    
    if (activeProjects.length > 0) {
      return {
        success: false,
        error: `Cannot delete client with ${activeProjects.length} active project(s). Please complete or archive projects first.`,
      };
    }

    // Check for unpaid invoices
    const unpaidInvoices = client.invoices.filter((i) =>
      ["DRAFT", "SENT", "OVERDUE"].includes(i.status)
    );

    if (unpaidInvoices.length > 0) {
      return {
        success: false,
        error: `Cannot delete client with ${unpaidInvoices.length} unpaid invoice(s). Please resolve invoices first.`,
      };
    }

    // Delete all related data in the correct order to avoid FK constraints
    
    // 1. Delete leads associated with this organization
    await db.lead.deleteMany({
      where: { organizationId: clientId },
    });

    // 2. Delete project requests
    await db.projectRequest.deleteMany({
      where: { organizationId: clientId },
    });

    // 3. Delete organization members
    await db.organizationMember.deleteMany({
      where: { organizationId: clientId },
    });

    // 4. Delete completed/archived projects (if any remain)
    await db.project.deleteMany({
      where: { organizationId: clientId },
    });

    // 5. Delete paid/cancelled invoices (if any remain)
    await db.invoice.deleteMany({
      where: { organizationId: clientId },
    });

    // 6. Finally, delete the organization itself
    await db.organization.delete({
      where: { id: clientId },
    });

    await logActivity({
      type: "SYSTEM_ALERT",
      title: `Client deleted`,
      description: `${client.name}`,
      userId: user.id,
      metadata: {
        clientId,
        clientName: client.name,
      },
    });

    revalidatePath("/admin/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete client:", error);
    const errorMessage = error?.message || "Failed to delete client";
    return { success: false, error: errorMessage };
  }
}




