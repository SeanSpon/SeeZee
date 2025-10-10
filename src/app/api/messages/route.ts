import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement messages retrieval logic
  return NextResponse.json({ message: "Messages endpoint - coming soon" }, { status: 501 });
}

export async function POST(request: NextRequest) {
  // TODO: Implement message creation logic
  return NextResponse.json({ message: "Create message endpoint - coming soon" }, { status: 501 });
}