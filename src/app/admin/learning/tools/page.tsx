/**
 * Tools Directory
 */

import { AdminToolsClient } from "@/components/admin/AdminToolsClient";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  // Get user role for permissions
  const user = await requireRole([
    ROLE.CEO,
    ROLE.CFO,
    ROLE.FRONTEND,
    ROLE.BACKEND,
    ROLE.OUTREACH,
  ]);

  // Fetch tools directly from the database (seezeestudios.com database)
  const tools = await prisma.toolEntry.findMany({
    orderBy: { name: "asc" },
  });

  // Convert to serializable format
  const serializedTools = tools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    category: tool.category,
    url: tool.url,
    description: tool.description,
    visibility: tool.visibility,
    icon: tool.icon,
    tags: tool.tags,
    createdAt: tool.createdAt.toISOString(),
  }));

  return <AdminToolsClient tools={serializedTools} userRole={user.role} />;
}


