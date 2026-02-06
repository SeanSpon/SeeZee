/**
 * Archive Page - View archived tasks, projects, and other items
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { ArchiveClient } from "@/components/admin/ArchiveClient";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch archived todos
  const archivedTodos = await db.todo.findMany({
    where: { archived: true },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, image: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { archivedAt: "desc" },
  });

  // Fetch archived projects
  const archivedProjects = await db.project.findMany({
    where: { archived: true },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { archivedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
          Archive
        </span>
        <h1 className="text-3xl font-heading font-bold text-white">Archived Items</h1>
        <p className="max-w-2xl text-sm text-gray-400">
          View and manage archived tasks and projects. Archived items are hidden from active views but can be restored if needed.
        </p>
      </header>

      <ArchiveClient
        todos={archivedTodos as any}
        projects={archivedProjects as any}
        userId={session.user.id}
      />
    </div>
  );
}
