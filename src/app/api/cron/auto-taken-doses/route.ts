import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { processAutoTakenDoses } from '@/lib/auto-taken-doses';
import { authorizeCronRequest } from '@/lib/notifications/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = authorizeCronRequest(request);
  if (unauthorized) return unauthorized;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const admin = createAdminClient();
  const result = await processAutoTakenDoses(admin);

  return NextResponse.json({
    success: true,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
