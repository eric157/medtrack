import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getMedtrackTimezone,
  getTodayKey,
  hasBlockEnded,
  isLogOnDate,
} from '@/lib/time-blocks';

export interface MissedDoseResult {
  recorded: number;
  names: string[];
}

/** Record missed dose logs for medications whose time window ended with no log today. */
export async function processMissedDoses(admin: SupabaseClient): Promise<MissedDoseResult> {
  const timeZone = getMedtrackTimezone();
  const now = new Date();
  const todayKey = getTodayKey(now, timeZone);

  const { data: medications, error: medError } = await admin
    .from('medications')
    .select('id, patient_id, name, time_of_day')
    .eq('is_active', true);

  if (medError || !medications?.length) {
    return { recorded: 0, names: [] };
  }

  const since = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const { data: recentLogs } = await admin
    .from('dose_logs')
    .select('medication_id, logged_at')
    .gte('logged_at', since);

  const loggedTodayMedIds = new Set(
    (recentLogs ?? [])
      .filter(log => isLogOnDate({ logged_at: log.logged_at as string }, todayKey, timeZone))
      .map(log => log.medication_id as string),
  );

  const names: string[] = [];

  for (const med of medications) {
    if (loggedTodayMedIds.has(med.id)) continue;
    if (!hasBlockEnded(med.time_of_day, now, timeZone)) continue;

    const { error } = await admin.from('dose_logs').insert({
      medication_id: med.id,
      patient_id: med.patient_id,
      scheduled_time_of_day: med.time_of_day,
      status: 'missed',
    });

    if (!error) {
      names.push(med.name);
      loggedTodayMedIds.add(med.id);
    }
  }

  return { recorded: names.length, names };
}
