"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { feedHelpers } from "@/lib/feed/emit";

/**
 * Approve a lead and create a project
 * CEO/Admin action to convert lead to active project
 */
export async function approveLeadAndCreateProject(leadId: string) {
  const session = await auth();
  
  if (!session?.user || !["CEO", "ADMIN"].includes(session.user.role || "")) {
    throw new Error("Unauthorized: CEO or Admin role required");
  }

  try {
    // Get the lead with organization
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

    // Check if project already exists
    const existingProject = await prisma.project.findFirst({
      where: { leadId },
    });

    if (existingProject) {
      throw new Error("Project already exists for this lead");
    }

    // Create organization if lead doesn't have one
    let orgId = lead.organizationId;
    if (!orgId) {
      const orgName = lead.company || `${lead.name}'s Organization`;
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const organization = await prisma.organization.create({
        data: {
          name: orgName,
          slug: `${slug}-${Date.now()}`, // Ensure unique slug
          email: lead.email,
          phone: lead.phone,
        },
      });
      
      orgId = organization.id;
      
      // Update lead with organizationId
      await prisma.lead.update({
        where: { id: leadId },
        data: { organizationId: orgId },
      });
    }

    // Extract questionnaireId from lead metadata
    const questionnaireId = lead.metadata && typeof lead.metadata === 'object' && 'qid' in lead.metadata 
      ? (lead.metadata as any).qid 
      : null;

    // Check if questionnaireId is already linked to another project
    if (questionnaireId) {
      const projectWithQuestionnaire = await prisma.project.findUnique({
        where: { questionnaireId },
      });

      if (projectWithQuestionnaire) {
        throw new Error("This questionnaire is already linked to another project");
      }
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: lead.company || `Project for ${lead.name}`,
        description: lead.message || `${lead.serviceType || "Web"} project`,
        status: "LEAD", // Will move to IN_PROGRESS after deposit
        organizationId: orgId,
        leadId: lead.id,
        questionnaireId,
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

    // Emit feed event
    await feedHelpers.projectCreated(project.id, project.name);

    revalidatePath("/admin/pipeline/leads");
    revalidatePath(`/admin/pipeline/leads/${leadId}`);
    revalidatePath("/admin/pipeline/projects");

    return { success: true, projectId: project.id };
  } catch (error) {
    console.error("[Approve Lead Error]", error);
    throw error;
  }
}
