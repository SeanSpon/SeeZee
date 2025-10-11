import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, pending, inProgress, review, delivered] = await Promise.all([
      prisma.projectRequest.count(),
      prisma.projectRequest.count({ where: { status: "pending" } }),
      prisma.projectRequest.count({ where: { status: "in progress" } }),
      prisma.projectRequest.count({ where: { status: "review" } }),
      prisma.projectRequest.count({ where: { status: "delivered" } }),
    ]);

    return NextResponse.json({ 
      total, 
      byStatus: { pending, inProgress, review, delivered } 
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}