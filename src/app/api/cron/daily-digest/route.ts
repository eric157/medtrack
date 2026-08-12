import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { authorizeCronRequest } from '@/lib/notifications/cron-auth';
import { sendDailyDigest } from '@/lib/notifications/daily-digest';
import { processAutoTakenDoses } from '@/lib/auto-taken-doses';
import { buildCaregiverAlertSms } from '@/lib/notifications/messages';
import { notifyCaregivers } from '@/lib/notifications/dispatch';
import { getMedtrackTimezone, getTodayKey } from '@/lib/time-blocks';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = authorizeCronRequest(request);
  if (unauthorized) return unauthorized;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const admin = createAdminClient();
  const autoTaken = await processAutoTakenDoses(admin);

  let autoTakenNotify = null;
  if (autoTaken.recorded > 0) {
    const todayKey = getTodayKey(new Date(), getMedtrackTimezone());
    const label = autoTaken.names.length <= 4
      ? autoTaken.names.join(', ')
      : `${autoTaken.names.slice(0, 4).join(', ')} +${autoTaken.names.length - 4} more`;

    autoTakenNotify = await notifyCaregivers(
      admin,
      'auto_taken',
      `${todayKey}-auto-taken-digest`,
      buildCaregiverAlertSms(
        'Auto-marked doses',
        `${autoTaken.recorded} medication(s) marked taken after time window: ${label}`,
      ),
    );
  }

  const digest = await sendDailyDigest(admin);

  return NextResponse.json({
    success: true,
    autoTaken,
    autoTakenNotify,
    digest,
    timestamp: new Date().toISOString(),
  });
}
