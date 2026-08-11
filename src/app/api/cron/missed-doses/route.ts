import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { processMissedDoses } from '@/lib/missed-doses';
import { sendPushToAllCaregivers } from '@/lib/actions/push-actions';

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
  const result = await processMissedDoses(admin);

  if (result.recorded > 0) {
    const label = result.names.length <= 3
      ? result.names.join(', ')
      : `${result.names.slice(0, 3).join(', ')} +${result.names.length - 3} more`;

    await sendPushToAllCaregivers(
      '⚠️ Missed Dose Alert',
      `${result.recorded} medication(s) not marked taken: ${label}`,
      '/dashboard',
    );
  }

  return NextResponse.json({
    success: true,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
