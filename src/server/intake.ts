import { createHash, randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { mapBudgetToTier } from "@/lib/budget-mapping";
import type { IntakeInput } from "@/lib/validation/intake";

type Identity = { id: string; email: string; name: string | null } | null;
export async function submitIntake(
  db: PrismaClient,
  input: IntakeInput,
  identity: Identity,
) {
  // Stable across retries; distinct payloads from the same client remain separate requests.
  const submissionKey = createHash("sha256")
    .update(
      JSON.stringify([identity?.id ?? "public", input.submissionId ?? input]),
    )
    .digest("hex");
  const existing = () =>
    db.lead.findUnique({
      where: { submissionKey },
      select: { id: true, intakeRequest: { select: { id: true } } },
    });
  const previous = await existing();
  if (previous)
    return {
      leadId: previous.id,
      projectRequestId: previous.intakeRequest?.id,
      duplicate: true,
    };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(
        async (tx) => {
          // Never attach an anonymous submission to an account or grant organization membership by typed email.
          let organizationId: string | null = null;
          if (identity) {
            const membership = await tx.organizationMember.findFirst({
              where: { userId: identity.id },
              orderBy: { id: "asc" },
              select: { organizationId: true },
            });
            organizationId = membership?.organizationId ?? null;
            if (!organizationId) {
              const organization = await tx.organization.create({
                data: {
                  name: input.company || `${input.name}'s Organization`,
                  slug: `client-${randomUUID()}`,
                  email: input.email,
                  phone: input.phone || null,
                  members: { create: { userId: identity.id, role: "OWNER" } },
                },
              });
              organizationId = organization.id;
            }
          }
          const lead = await tx.lead.create({
            data: {
              submissionKey,
              name: input.name,
              email: input.email,
              phone: input.phone || null,
              company: input.company || null,
              message: input.projectGoals,
              budget: input.budget || null,
              timeline: input.timeline || input.urgency || null,
              websiteUrl: input.websiteUrl || input.currentWebsite || null,
              serviceType: input.serviceType,
              source: "WEBSITE_INTAKE",
              status: "NEW",
              userId: identity?.id ?? null,
              organizationId,
              metadata: JSON.parse(
                JSON.stringify(input),
              ) as Prisma.InputJsonValue,
            },
          });
          const request = await tx.projectRequest.create({
            data: {
              leadId: lead.id,
              userId: identity?.id ?? null,
              name: input.name,
              contactEmail: input.email,
              company: input.company || null,
              title: `${input.company || input.name} — ${input.serviceType === "MAINTENANCE_PLAN" ? "Maintenance" : "Website"} request`,
              description: input.projectGoals,
              timeline: input.timeline || input.urgency || null,
              budget: mapBudgetToTier(input.budget),
              services: ["WEBSITE"],
              status: "SUBMITTED",
              estimatedHours: input.estimatedHours,
            },
          });
          return {
            leadId: lead.id,
            projectRequestId: request.id,
            duplicate: false,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const duplicate = await existing();
          if (duplicate)
            return {
              leadId: duplicate.id,
              projectRequestId: duplicate.intakeRequest?.id,
              duplicate: true,
            };
        }
        if (error.code === "P2034" && attempt < 2) continue;
      }
      throw error;
    }
  }
  throw new Error("Submission could not be saved");
}
