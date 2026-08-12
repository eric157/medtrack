import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { authorizeCronRequest } from '@/lib/notifications/cron-auth';
import { isValidTimeBlock, sendMedicationReminders } from '@/lib/notifications/reminders';

export async function GET(request: Request) {
  const unauthorized = authorizeCronRequest(request);
  if (unauthorized) return unauthorized;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const block = new URL(request.url).searchParams.get('block');
  const force = new URL(request.url).searchParams.get('force') === '1';
  if (!isValidTimeBlock(block)) {
    return NextResponse.json(
      { error: 'Invalid block. Use ?block=morning|afternoon|evening|night' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const result = await sendMedicationReminders(admin, block, force);

  const allErrors = result.results.flatMap(r => r.errors);
  const smsSent = result.results.reduce((n, r) => n + r.sms.sent, 0);

  return NextResponse.json({
    success: smsSent > 0 || allErrors.length === 0,
    config: {
      sms: Boolean(process.env.SMSMOBILEAPI_KEY),
      supabase: true,
    },
    errors: allErrors,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
