import type { SupabaseClient } from '@supabase/supabase-js';
import type { TimeOfDay } from '@/lib/types';
import { getMedtrackTimezone, getTodayKey, TIME_BLOCK_ORDER } from '@/lib/time-blocks';
import { getRecipientByPatientName } from '@/lib/notifications/recipients';
import { buildReminderSms } from '@/lib/notifications/messages';
import { notifyPatient } from '@/lib/notifications/dispatch';
import type { NotifyResult } from '@/lib/notifications/dispatch';

export async function sendMedicationReminders(
  admin: SupabaseClient,
  block: TimeOfDay,
  force = false,
): Promise<{ block: TimeOfDay; results: NotifyResult[] }> {
  const timeZone = getMedtrackTimezone();
  const todayKey = getTodayKey(new Date(), timeZone);
  const eventKeyPrefix = force ? `${todayKey}-${block}-force-${Date.now()}` : `${todayKey}-${block}`;

  const { data: medications } = await admin
    .from('medications')
    .select('name, patient_id, time_of_day, patients(name)')
    .eq('is_active', true)
    .eq('time_of_day', block);

  const { data: patients } = await admin.from('patients').select('id, name');

  const byPatient = new Map<string, { patientName: string; meds: string[] }>();

  for (const med of medications ?? []) {
    const row = med as {
      name: string;
      patient_id: string;
      patients?: { name?: string } | null;
    };
    const patientRow = row.patients;
    const patientName = patientRow?.name ?? patients?.find(p => p.id === row.patient_id)?.name ?? 'Patient';
    const existing = byPatient.get(row.patient_id) ?? { patientName, meds: [] as string[] };
    existing.meds.push(row.name);
    byPatient.set(row.patient_id, existing);
  }

  const results: NotifyResult[] = [];

  for (const { patientName, meds } of Array.from(byPatient.values())) {
    const recipient = getRecipientByPatientName(patientName);
    if (!recipient || meds.length === 0) continue;

    const message = buildReminderSms(recipient.name, block, meds);
    const result = await notifyPatient(
      admin,
      recipient.key,
      'medication_reminder',
      `${eventKeyPrefix}-${recipient.key}`,
      message,
    );
    results.push(result);
  }

  return { block, results };
}

export function isValidTimeBlock(value: string | null): value is TimeOfDay {
  return Boolean(value && TIME_BLOCK_ORDER.includes(value as TimeOfDay));
}
