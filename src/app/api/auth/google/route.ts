import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  if (!clientId) {
    return NextResponse.json({
      error: 'Google OAuth Client ID not set',
      instruction: 'To enable live Google OAuth 2.0 integration, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.'
    }, { status: 400 });
  }

  const scopes = [
    'https://www.googleapis.com/auth/tasks',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  return NextResponse.redirect(authUrl);
}
