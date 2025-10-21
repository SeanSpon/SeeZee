import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get files for the current user's projects
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  include: {
                    files: {
                      orderBy: {
                        createdAt: "desc",
                      },
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
      return NextResponse.json({ files: [] });
    }

    // Flatten files from all projects
    const files = user.organizations
      .flatMap((orgMember) =>
        orgMember.organization.projects.flatMap((project) =>
          project.files.map((file) => ({
            id: file.id,
            name: file.name,
            size: file.size,
            uploadedAt: file.createdAt.toISOString(),
            type: file.type,
            mimeType: file.mimeType,
            url: file.url,
          }))
        )
      )
      .filter((file) => file.type !== "OTHER" || file.mimeType.includes("pdf")); // Filter out irrelevant files

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Failed to fetch client files:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
