import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FolderKanban, Clock, CheckCircle2, AlertCircle, Plus, ArrowRight } from "lucide-react";
import { ProjectsClient } from "../components/ProjectsClient";

export default async function ClientProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch client's projects via Lead relationship OR organization membership
  // First, get user's organizations
  const userOrgs = await prisma.organizationMember.findMany({
    where: {
      userId: session.user.id!,
    },
    select: {
      organizationId: true,
    },
  });

  const orgIds = userOrgs.map((om) => om.organizationId);

  // Build where clause: projects where user is lead OR user is org member
  const whereClause: any = {
    OR: [
      // Projects where lead email matches user email
      {
        lead: {
          email: session.user.email!,
        },
      },
      // Projects where user is a member of the organization
      ...(orgIds.length > 0
        ? [
            {
              organizationId: {
                in: orgIds,
              },
            },
          ]
        : []),
    ],
  };

  const projects = await prisma.project.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      budget: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      assigneeId: true,
      leadId: true,
      organizationId: true,
      questionnaireId: true,
      stripeCustomerId: true,
      maintenancePlan: true,
      maintenanceStatus: true,
      nextBillingDate: true,
      githubRepo: true,
      assignee: {
        select: {
          name: true,
          image: true,
        },
      },
      milestones: {
        select: {
          completed: true,
        },
      },
    },
  });

  const getStatusBadge = (status: string) => {
    const config = {
      COMPLETED: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Completed" },
      ACTIVE: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "Active" },
      IN_PROGRESS: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "In Progress" },
      DESIGN: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", label: "Design" },
      BUILD: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30", label: "Build" },
      REVIEW: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30", label: "Review" },
      ON_HOLD: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: "On Hold" },
      PLANNING: { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30", label: "Planning" },
      PAID: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30", label: "Paid" },
      LEAD: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30", label: "Lead" },
      LAUNCH: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Launch" },
    }[status] || { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: status };
    
    return config;
  };

  // Convert Decimal budget to number for client components
  // Explicitly construct objects to avoid passing Prisma Decimal objects
  const serializedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    budget: project.budget ? Number(project.budget) : null,
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    assigneeId: project.assigneeId,
    leadId: project.leadId,
    organizationId: project.organizationId,
    questionnaireId: project.questionnaireId,
    stripeCustomerId: project.stripeCustomerId,
    maintenancePlan: project.maintenancePlan,
    maintenanceStatus: project.maintenanceStatus,
    nextBillingDate: project.nextBillingDate,
    githubRepo: project.githubRepo,
    assignee: project.assignee,
    milestones: project.milestones,
  }));

  return <ProjectsClient projects={serializedProjects} />;
}
