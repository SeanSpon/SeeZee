import { NextResponse } from 'next/server';

export async function GET() {
  const googleAuthUrl = new URL('https://accounts.google.com/oauth2/v2/auth');
  
  googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  googleAuthUrl.searchParams.set('redirect_uri', 'http://localhost:3000/api/auth/callback/google');
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', 'test-direct-oauth');

  console.log('[DIRECT GOOGLE URL]', googleAuthUrl.toString());

  return NextResponse.json({
    googleUrl: googleAuthUrl.toString(),
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    redirectUri: 'http://localhost:3000/api/auth/callback/google',
  });
}