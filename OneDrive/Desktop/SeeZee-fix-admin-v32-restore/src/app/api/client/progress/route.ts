import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get projects for the current user's organization
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  where: {
                    status: {
                      in: ["IN_PROGRESS", "REVIEW", "PAID"],
                    },
                  },
                  include: {
                    milestones: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.organizations.length === 0) {
      return NextResponse.json({ projects: [] });
    }

    // Flatten projects from all organizations
    const projects = user.organizations.flatMap((orgMember) =>
      orgMember.organization.projects.map((project) => {
        const completedMilestones = project.milestones.filter((m) => m.completed).length;
        const totalMilestones = project.milestones.length || 1;
        const progress = Math.round((completedMilestones / totalMilestones) * 100);

        return {
          id: project.id,
          name: project.name,
          progress,
          status: project.status,
          milestones: {
            total: totalMilestones,
            completed: completedMilestones,
          },
        };
      })
    );

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to fetch client progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
