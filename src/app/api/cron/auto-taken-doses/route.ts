import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { processAutoTakenDoses } from '@/lib/auto-taken-doses';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
