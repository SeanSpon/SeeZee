import { NextRequest, NextResponse } from "next/server";
import { withInternalStaff, getSession } from "@/server/http";
import { getTasks } from "@/server/actions/tasks";

/**
 * GET /api/tasks
 * Staff-only: Get tasks with optional filters
 */
export const GET = withInternalStaff(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assignedToRole = searchParams.get("assignedToRole");
    const projectId = searchParams.get("projectId");

    const result = await getTasks({
      status: status as any,
      assignedToRole: assignedToRole as any,
      projectId: projectId || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks: result.tasks }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
});

