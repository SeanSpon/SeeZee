"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LeadStatus } from "@prisma/client";

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || !["ADMIN", "STAFF"].includes(user.role)) {
      throw new Error("Only admins and staff can update lead status");
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        convertedAt: status === "CONVERTED" ? new Date() : undefined,
      },
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin/overview");

    return {
      success: true,
      lead,
    };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update lead status",
    };
  }
}

export async function deleteLead(leadId: string) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Only admins can delete leads");
    }

    await prisma.lead.delete({
      where: { id: leadId },
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin/overview");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting lead:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete lead",
    };
  }
}
