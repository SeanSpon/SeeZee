"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ClientIdentity, ClientAccessContext } from "./client-access-types";
import { ClientAccessError } from "./client-access-types";

/**
 * Resolve organizations and projects a client can access based on both
 * lead email and organization membership records.
 */
export async function getClientAccessContext(
  identity: ClientIdentity
): Promise<ClientAccessContext> {
  if (!identity.userId && !identity.email) {
    return { organizationIds: [], leadProjectIds: [] };
  }

  const [memberships, leads] = await Promise.all([
    identity.userId
      ? prisma.organizationMember.findMany({
          where: { userId: identity.userId },
          select: { organizationId: true },
        })
      : Promise.resolve([]),
    identity.email
      ? prisma.lead.findMany({
          where: { email: identity.email },
          select: {
            organizationId: true,
            project: {
              select: { id: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const organizationIds = new Set<string>();
  memberships.forEach((membership) => {
    if (membership.organizationId) {
      organizationIds.add(membership.organizationId);
    }
  });

  const leadProjectIds = new Set<string>();
  leads.forEach((lead) => {
    if (lead.organizationId) {
      organizationIds.add(lead.organizationId);
    }
    if (lead.project?.id) {
      leadProjectIds.add(lead.project.id);
    }
  });

  return {
    organizationIds: Array.from(organizationIds),
    leadProjectIds: Array.from(leadProjectIds),
  };
}

/**
 * Convenience helper to fetch organization identifiers only.
 */
export async function getClientOrganizations(
  identity: ClientIdentity
): Promise<string[]> {
  const { organizationIds } = await getClientAccessContext(identity);
  return organizationIds;
}

/**
 * Build a Prisma where clause that limits projects to the client's accessible scope.
 */
export async function buildClientProjectWhere(
  identity: ClientIdentity
): Promise<Prisma.ProjectWhereInput> {
  const { organizationIds, leadProjectIds } = await getClientAccessContext(
    identity
  );

  const orConditions: Prisma.ProjectWhereInput[] = [];

  if (identity.email) {
    orConditions.push({
      lead: {
        email: identity.email,
      },
    });
  }

  if (organizationIds.length > 0) {
    orConditions.push({
      organizationId: {
        in: organizationIds,
      },
    });
  }

  if (leadProjectIds.length > 0) {
    orConditions.push({
      id: {
        in: leadProjectIds,
      },
    });
  }

  if (orConditions.length === 0) {
    // Return an impossible clause so callers can short-circuit cleanly.
    return {
      id: "__client_no_access__",
    };
  }

  return {
    OR: orConditions,
  };
}

type ProjectArgs = Prisma.ProjectFindFirstArgs;

/**
 * Fetch a project that the client has access to, throwing if the project
 * is not found or outside the client's scope.
 */
export async function getClientProjectOrThrow<T extends ProjectArgs>(
  identity: ClientIdentity,
  projectId: string,
  args?: Omit<T, "where">
): Promise<Prisma.ProjectGetPayload<T>> {
  const accessWhere = await buildClientProjectWhere(identity);
  const orConditions =
    "OR" in accessWhere && Array.isArray(accessWhere.OR)
      ? accessWhere.OR
      : [];

  if (orConditions.length === 0) {
    throw new ClientAccessError(
      "You do not have any active projects assigned yet."
    );
  }

  const andConditions: Prisma.ProjectWhereInput[] = [
    { id: projectId },
    { OR: orConditions },
  ];

  const project = await prisma.project.findFirst({
    ...(args as Prisma.ProjectFindFirstArgs),
    where: {
      AND: andConditions,
    },
  } as Prisma.ProjectFindFirstArgs);

  if (!project) {
    throw new ClientAccessError("Project not found or access denied.");
  }

  return project as Prisma.ProjectGetPayload<T>;
}

/**
 * Ensure the client has access to a given organization.
 */
export async function ensureClientOrganizationAccess(
  identity: ClientIdentity,
  organizationId: string
): Promise<boolean> {
  const organizations = await getClientOrganizations(identity);
  return organizations.includes(organizationId);
}

