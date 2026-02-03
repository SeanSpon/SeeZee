import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ClientDetailClient } from "@/components/admin/ClientDetailClient";
import { toPlain } from "@/lib/serialize";

export const dynamic = "force-dynamic";

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { id } = await params;

  // Try to find the client as an Organization first
  let organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      },
      projects: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        include: {
          items: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      leads: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // If not found as organization, try as Lead
  let lead = null;
  if (!organization) {
    lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                  },
                },
              },
            },
            projects: {
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                lead: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    status: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            invoices: {
              include: {
                items: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            leads: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        project: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // If nothing found, return 404
  if (!organization && !lead) {
    notFound();
  }

  // Build client data structure
  const clientData = {
    id,
    type: (organization ? "organization" : "lead") as "organization" | "lead",
    organization: organization ? toPlain(organization) : null,
    lead: lead ? toPlain(lead) : null,
  };

  return <ClientDetailClient clientData={clientData} user={user} />;
}

