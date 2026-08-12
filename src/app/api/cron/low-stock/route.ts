import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { authorizeCronRequest } from '@/lib/notifications/cron-auth';
import { calculateDepletionForecast } from '@/lib/forecasting';
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
  const { data: medications } = await admin.from('medications').select('*').eq('is_active', true);
  const { data: patients } = await admin.from('patients').select('*');

  const lowStock = (medications ?? [])
    .map(m => {
      const p = patients?.find(pt => pt.id === m.patient_id);
      return calculateDepletionForecast(m, p?.name ?? '');
    })
    .filter(f => f.isLowStock);

  let notify = null;
  if (lowStock.length > 0) {
    const todayKey = getTodayKey(new Date(), getMedtrackTimezone());
    const names = lowStock.map(l => `${l.medicationName} (${l.patientName})`).join(', ');
    notify = await notifyCaregivers(
      admin,
      'low_stock',
      `${todayKey}-low-stock`,
      buildCaregiverAlertSms(
        'Low medication stock',
        `${lowStock.length} item(s): ${names}`,
      ),
      `MedTrack: Low Stock Alert (${lowStock.length} items)`,
      `<p>The following medications are running low:</p><ul>${lowStock.map(l =>
        `<li><strong>${l.medicationName}</strong> (${l.patientName}) — ${l.daysLeft} days remaining</li>`,
      ).join('')}</ul>`,
    );
  }

  return NextResponse.json({
    success: true,
    lowStockCount: lowStock.length,
    notify,
    timestamp: new Date().toISOString(),
  });
}
