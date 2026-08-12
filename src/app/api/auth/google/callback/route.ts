import { NextResponse } from 'next/server';
import { createClient, createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const siteUrl = getSiteUrl();

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/dashboard?google=error`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${siteUrl}/dashboard?google=token_error`);
  }

  const tokens = await tokenRes.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${siteUrl}/dashboard?google=simulated`);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login?redirect=/dashboard&google=needs_auth`);
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  const admin = createAdminClient();

  await admin.from('user_integrations').upsert({
    user_id: user.id,
    provider: 'google',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiresAt,
  }, { onConflict: 'user_id,provider' });

  return NextResponse.redirect(`${siteUrl}/dashboard?google=connected`);
}
