import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement inquiries retrieval logic
  return NextResponse.json({ message: "Inquiries endpoint - coming soon" }, { status: 501 });
}

export async function POST(request: NextRequest) {
  // TODO: Implement inquiry creation logic
  return NextResponse.json({ message: "Create inquiry endpoint - coming soon" }, { status: 501 });
}