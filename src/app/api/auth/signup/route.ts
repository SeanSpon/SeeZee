import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // TODO: Implement user signup logic
  return NextResponse.json({ message: "Signup endpoint - coming soon" }, { status: 501 });
}