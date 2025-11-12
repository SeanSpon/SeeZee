import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getClientProjectOrThrow } from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";
import { ProjectDetailClient } from "../../components/ProjectDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let project;
  try {
    project = await getClientProjectOrThrow(
      { userId: session.user.id, email: session.user.email },
      id,
      {
        include: {
          assignee: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          milestones: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              completed: true,
              dueDate: true,
              createdAt: true,
            },
          },
          feedEvents: {
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
              id: true,
              type: true,
              payload: true,
              createdAt: true,
            },
          },
          questionnaire: true, // Include questionnaire data
          files: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              type: true,
              createdAt: true,
            },
          },
        },
      }
    );
  } catch (error) {
    if (error instanceof ClientAccessError) {
      notFound();
    }

    throw error;
  }

  // Transform milestones to match component interface
  const transformedMilestones = (project as any).milestones?.map((m: any) => ({
    id: m.id,
    name: m.title,
    description: m.description,
    completed: m.completed,
    dueDate: m.dueDate,
    createdAt: m.createdAt,
  })) || [];

  // Transform feed events to match component interface
  const transformedFeedEvents = (project as any).feedEvents?.map((event: any) => {
    const payload = event.payload as any || {};
    return {
      id: event.id,
      type: event.type,
      title: payload.title || payload.name || `Event: ${event.type}`,
      description: payload.description || payload.message || null,
      createdAt: event.createdAt,
      user: payload.user ? {
        name: payload.user.name || null,
      } : null,
    };
  }) || [];

  return (
    <ProjectDetailClient
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget ? Number(project.budget) : null,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt,
        assignee: (project as any).assignee,
        milestones: transformedMilestones,
        feedEvents: transformedFeedEvents,
        files: (project as any).files || [],
        questionnaire: (project as any).questionnaire || null,
      }}
    />
  );
}
