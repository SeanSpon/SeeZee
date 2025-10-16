import { NextResponse } from "next/server";

export async function GET() {
  try {
    // stub feed; replace with ActivityLog later
    const items = [
      { id: 1, who: "Zach", text: "updated a project to review", ago: "2h" },
      { id: 2, who: "Sean", text: "created a new project request", ago: "6h" },
      { id: 3, who: "System", text: "database backup completed", ago: "8h" },
    ];

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}