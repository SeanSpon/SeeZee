/**
 * GET /api/client/projects/[id]/summary
 * Analyzes recent Git commits and suggests change requests using AI
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRecentCommits, projectRepo } from "@/server/github";
import { summarizeCommitsLLM } from "@/server/ai";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Verify user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: { userId: session.user.id },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Get GitHub repo
    const repo = await projectRepo(projectId);
    if (!repo) {
      return NextResponse.json(
        { summary: "No GitHub repository configured for this project." },
        { status: 200 }
      );
    }

    // Fetch recent commits
    const commits = await getRecentCommits(repo, 10);
    if (commits.length === 0) {
      return NextResponse.json(
        { summary: "No recent commits found." },
        { status: 200 }
      );
    }

    // Generate AI suggestions
    const suggestions = await summarizeCommitsLLM(commits);

    return NextResponse.json({
      summary: `Analyzed ${commits.length} recent commits from ${repo}`,
      suggestions,
      repo,
      commitCount: commits.length,
    });
  } catch (error) {
    console.error("Error generating project summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
