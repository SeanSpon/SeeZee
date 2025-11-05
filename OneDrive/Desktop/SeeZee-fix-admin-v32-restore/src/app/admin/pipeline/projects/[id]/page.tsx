import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectDetailClient } from "@/components/admin/ProjectDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || !["CEO", "ADMIN"].includes(session.user.role || "")) {
    redirect("/login");
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          status: true,
        },
      },
      milestones: {
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
      feedEvents: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}
