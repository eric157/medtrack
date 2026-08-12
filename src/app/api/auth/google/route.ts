import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const siteUrl = getSiteUrl();
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json({
      error: 'Google OAuth Client ID not set',
      instruction: 'Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXT_PUBLIC_SITE_URL in environment variables.',
    }, { status: 400 });
  }

  const scopes = [
    'https://www.googleapis.com/auth/tasks',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(authUrl.toString());
}
