import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get projects for the current user that might have GitHub repos
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
                      in: ["IN_PROGRESS", "REVIEW", "PAID", "COMPLETED"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.organizations.length === 0) {
      return NextResponse.json({ repos: [] });
    }

    // Mock GitHub repos for now - in production, this would fetch from GitHub API
    const repos = user.organizations
      .flatMap((orgMember) =>
        orgMember.organization.projects.map((project) => ({
          id: project.id,
          name: `${project.name.toLowerCase().replace(/\s+/g, "-")}-repo`,
          url: `https://github.com/seezee/${project.name.toLowerCase().replace(/\s+/g, "-")}`,
          lastCommit: project.updatedAt
            ? {
                message: "Latest updates and improvements",
                author: "SeeZee Team",
                date: project.updatedAt.toISOString(),
              }
            : undefined,
        }))
      )
      .slice(0, 5); // Limit to 5 repos

    return NextResponse.json({ repos });
  } catch (error) {
    console.error("Failed to fetch GitHub repos:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
