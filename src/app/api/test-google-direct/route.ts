import { NextResponse } from 'next/server';

export async function GET() {
  const googleAuthUrl = new URL('https://accounts.google.com/oauth2/v2/auth');
  
  googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  googleAuthUrl.searchParams.set('redirect_uri', `${baseUrl}/api/auth/callback/google`);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', 'test-direct-oauth');

  console.log('[DIRECT GOOGLE URL]', googleAuthUrl.toString());

  return NextResponse.json({
    googleUrl: googleAuthUrl.toString(),
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    redirectUri: `${baseUrl}/api/auth/callback/google`,
  });
}