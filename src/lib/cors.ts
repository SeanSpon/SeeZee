import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://seezeestudios.com",
  "https://www.seezeestudios.com",
  "https://see-zee.com",
  "https://www.see-zee.com",
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function handleCors(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  }

  return null;
}

export function addCorsHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

