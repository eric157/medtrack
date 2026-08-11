'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { sendPushToAllCaregivers } from '@/lib/actions/push-actions';
import { getSiteUrl } from '@/lib/site-url';
import { getMedtrackTimezone, getTodayKey, isLogOnDate } from '@/lib/time-blocks';
import type { Medication, Patient, DoseLog, TimeOfDay } from '@/lib/types';
import { SEED_PATIENTS, SEED_MEDICATIONS } from '@/lib/seed-data';
import { dedupeMedications } from '@/lib/dedupe-medications';

async function getSupabaseOrFallback() {
  if (!isSupabaseConfigured()) return null;
  return createClient();
}

export async function fetchPatients(): Promise<Patient[]> {
  const supabase = await getSupabaseOrFallback();
  if (!supabase) return SEED_PATIENTS;

  const { data, error } = await supabase.from('patients').select('*').order('name');
  if (error) throw error;
  return data ?? SEED_PATIENTS;
}

export async function fetchMedications(): Promise<Medication[]> {
  const supabase = await getSupabaseOrFallback();
  if (!supabase) return SEED_MEDICATIONS;

  const { data, error } = await supabase.from('medications').select('*').order('name');
  if (error) throw error;
  const meds = (data ?? []).map(m => ({ ...m, is_active: m.is_active ?? true }));
  return dedupeMedications(meds);
}

export async function fetchDoseLogs(limit = 100): Promise<DoseLog[]> {
  const supabase = await getSupabaseOrFallback();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('dose_logs')
    .select('*, medications(name), patients(name)')
    .order('logged_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    medication_id: row.medication_id as string,
    patient_id: row.patient_id as string,
    scheduled_time_of_day: row.scheduled_time_of_day as TimeOfDay,
    status: row.status as 'taken' | 'skipped',
    logged_at: row.logged_at as string,
    medication_name: (row.medications as { name?: string } | null)?.name,
    patient_name: (row.patients as { name?: string } | null)?.name,
  }));
}

function validateKioskPin(pin: string): boolean {
  const expected = process.env.KIOSK_PIN || '1234';
  return pin === expected;
}

/** Log dose — DB trigger handles stock decrement (no client double-decrement) */
export async function logDoseAction(
  medicationId: string,
  status: 'taken' | 'skipped',
  kioskPin?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const supabase = kioskPin
    ? (validateKioskPin(kioskPin)
        ? (process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : createClient())
        : null)
    : await createClient();

  if (!supabase) {
    return { success: false, error: kioskPin ? 'Invalid kiosk PIN' : 'Not authenticated' };
  }

  if (!kioskPin) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };
  }

  const { data: med } = await supabase
    .from('medications')
    .select('patient_id, time_of_day, dosage_per_take, current_stock, name')
    .eq('id', medicationId)
    .single();

  if (!med) return { success: false, error: 'Medication not found' };

  const timeZone = getMedtrackTimezone();
  const todayKey = getTodayKey(new Date(), timeZone);
  const { data: recentLogs } = await supabase
    .from('dose_logs')
    .select('id, status, logged_at')
    .eq('medication_id', medicationId)
    .gte('logged_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

  const existingToday = (recentLogs ?? []).find(
    log => isLogOnDate({ logged_at: log.logged_at as string }, todayKey, timeZone),
  );

  if (existingToday?.status === 'taken') {
    return { success: false, error: 'Dose already marked taken today' };
  }

  if (existingToday && status === 'taken') {
    const { error: updateError } = await supabase
      .from('dose_logs')
      .update({ status: 'taken', logged_at: new Date().toISOString() })
      .eq('id', existingToday.id);

    if (updateError) return { success: false, error: updateError.message };

    const newStock = Math.max(0, med.current_stock - med.dosage_per_take);
    await supabase
      .from('medications')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', medicationId);
  } else {
    const { error } = await supabase.from('dose_logs').insert({
      medication_id: medicationId,
      patient_id: med.patient_id,
      scheduled_time_of_day: med.time_of_day,
      status,
    });

    if (error) return { success: false, error: error.message };
  }

  if (status === 'taken') {
    await sendPushToAllCaregivers(
      '✅ Dose Logged',
      `${med.name ?? 'Medication'} marked taken via Parent Kiosk`,
      '/dashboard'
    );
  }

  revalidatePath('/kiosk');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateMedicationStockAction(
  medicationId: string,
  newStock: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabaseOrFallback();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('medications')
    .update({ current_stock: Math.max(0, newStock), updated_at: new Date().toISOString() })
    .eq('id', medicationId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}

export async function upsertMedicationAction(
  medication: Omit<Medication, 'id' | 'updated_at'> & { id?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabaseOrFallback();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const payload = { ...medication, updated_at: new Date().toISOString() };

  let targetId = medication.id;
  if (!targetId) {
    const { data: existing } = await supabase
      .from('medications')
      .select('id')
      .eq('patient_id', medication.patient_id)
      .eq('name', medication.name)
      .eq('time_of_day', medication.time_of_day)
      .maybeSingle();
    targetId = existing?.id;
  }

  const { error } = targetId
    ? await supabase.from('medications').update(payload).eq('id', targetId)
    : await supabase.from('medications').insert(payload);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/kiosk');
  return { success: true };
}

export async function deleteMedicationAction(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabaseOrFallback();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('medications').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/kiosk');
  return { success: true };
}

export async function signInWithMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabaseOrFallback();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const siteUrl = getSiteUrl();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await getSupabaseOrFallback();
  if (supabase) await supabase.auth.signOut();
  redirect('/login');
}

export async function verifyKioskPinAction(pin: string): Promise<boolean> {
  return validateKioskPin(pin);
}

export async function refillAllMedsToTargetAction(targetDays = 30): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabaseOrFallback();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: meds, error: fetchError } = await supabase.from('medications').select('*');
  if (fetchError) return { success: false, error: fetchError.message };

  for (const med of meds ?? []) {
    const dailyConsumption = Math.max(1, med.daily_frequency * med.dosage_per_take);
    const targetStock = targetDays * dailyConsumption;
    const newStock = Math.max(med.current_stock, targetStock);
    await supabase.from('medications').update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq('id', med.id);
  }

  revalidatePath('/dashboard');
  return { success: true };
}
