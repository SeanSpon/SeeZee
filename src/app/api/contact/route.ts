import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // TODO: Implement contact form submission logic
  return NextResponse.json({ message: "Contact form endpoint - coming soon" }, { status: 501 });
}