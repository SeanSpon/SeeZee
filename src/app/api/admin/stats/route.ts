import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, submitted, reviewing, needsInfo, approved] = await Promise.all([
      prisma.projectRequest.count(),
      prisma.projectRequest.count({ where: { status: "SUBMITTED" } }),
      prisma.projectRequest.count({ where: { status: "REVIEWING" } }),
      prisma.projectRequest.count({ where: { status: "NEEDS_INFO" } }),
      prisma.projectRequest.count({ where: { status: "APPROVED" } }),
    ]);

    return NextResponse.json({ 
      total, 
      byStatus: { submitted, reviewing, needsInfo, approved } 
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}