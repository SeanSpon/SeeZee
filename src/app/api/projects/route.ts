import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement projects retrieval logic
  return NextResponse.json({ message: "Projects endpoint - coming soon" }, { status: 501 });
}

export async function POST(request: NextRequest) {
  // TODO: Implement project creation logic
  return NextResponse.json({ message: "Create project endpoint - coming soon" }, { status: 501 });
}