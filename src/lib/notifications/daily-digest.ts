import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getMedtrackTimezone,
  getTodayKey,
  isLogOnDate,
} from '@/lib/time-blocks';
import { calculateDepletionForecast } from '@/lib/forecasting';
import {
  buildDailyDigestHtml,
  buildDailyDigestSms,
} from '@/lib/notifications/messages';
import { notifyCaregivers } from '@/lib/notifications/dispatch';
import type { NotifyResult } from '@/lib/notifications/dispatch';

export async function sendDailyDigest(admin: SupabaseClient): Promise<NotifyResult> {
  const timeZone = getMedtrackTimezone();
  const now = new Date();
  const todayKey = getTodayKey(now, timeZone);
  const eventKey = `${todayKey}-daily-digest`;

  const { data: medications } = await admin.from('medications').select('*').eq('is_active', true);
  const { data: patients } = await admin.from('patients').select('*');
  const since = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const { data: recentLogs } = await admin
    .from('dose_logs')
    .select('*')
    .gte('logged_at', since);

  const todayLogs = (recentLogs ?? []).filter(log =>
    isLogOnDate({ logged_at: log.logged_at as string }, todayKey, timeZone),
  );

  const dosesTaken = todayLogs.filter(l => l.status === 'taken').length;
  const totalScheduled = (medications ?? []).length;
  const compliancePercent = totalScheduled > 0
    ? Math.min(100, Math.round((dosesTaken / totalScheduled) * 100))
    : 100;

  const lowStock = (medications ?? [])
    .map(m => {
      const p = patients?.find(pt => pt.id === m.patient_id);
      return calculateDepletionForecast(m, p?.name ?? '');
    })
    .filter(f => f.isLowStock)
    .map(f => `${f.medicationName} (${f.patientName}) — ${f.daysLeft} days left`);

  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now);

  const summary = {
    dateLabel,
    dosesTaken,
    totalScheduled,
    autoTaken: dosesTaken,
    lowStock,
    compliancePercent,
  };

  const smsMessage = buildDailyDigestSms({
    dosesTaken,
    totalScheduled,
    compliancePercent,
    lowStockCount: lowStock.length,
  });

  const emailHtml = buildDailyDigestHtml(summary);

  return notifyCaregivers(
    admin,
    'daily_digest',
    eventKey,
    smsMessage,
    `MedTrack Daily Summary — ${dateLabel}`,
    emailHtml,
  );
}
