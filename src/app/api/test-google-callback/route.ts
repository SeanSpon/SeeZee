import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Log all parameters for debugging
  const allParams = Object.fromEntries(searchParams.entries());
  console.log('[GOOGLE CALLBACK]', {
    url: request.url,
    params: allParams,
    headers: Object.fromEntries(request.headers.entries()),
  });

  // Forward to the actual NextAuth callback
  return NextResponse.redirect(new URL('/api/auth/callback/google', request.url));
}