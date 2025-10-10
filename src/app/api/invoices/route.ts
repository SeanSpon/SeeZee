import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement invoices retrieval logic
  return NextResponse.json({ message: "Invoices endpoint - coming soon" }, { status: 501 });
}

export async function POST(request: NextRequest) {
  // TODO: Implement invoice creation logic
  return NextResponse.json({ message: "Create invoice endpoint - coming soon" }, { status: 501 });
}