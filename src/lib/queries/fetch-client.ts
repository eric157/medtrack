import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Medication, Patient, DoseLog, TimeOfDay } from '@/lib/types';
import { SEED_MEDICATIONS, SEED_PATIENTS } from '@/lib/seed-data';
import { dedupeMedications } from '@/lib/dedupe-medications';

/** Client-side reads — uses NEXT_PUBLIC_* keys directly (works reliably in local dev) */
export async function fetchPatientsClient(): Promise<Patient[]> {
  if (!isSupabaseConfigured()) return SEED_PATIENTS;

  const supabase = createClient();
  const { data, error } = await supabase.from('patients').select('*').order('name');

  if (error) {
    console.error('fetchPatientsClient:', error.message);
    throw new Error(error.message);
  }
  return data?.length ? data : SEED_PATIENTS;
}

export async function fetchMedicationsClient(): Promise<Medication[]> {
  if (!isSupabaseConfigured()) return SEED_MEDICATIONS;

  const supabase = createClient();
  const { data, error } = await supabase.from('medications').select('*').order('name');

  if (error) {
    console.error('fetchMedicationsClient:', error.message);
    throw new Error(error.message);
  }
  const meds = (data ?? []).map(m => ({ ...m, is_active: m.is_active ?? true }));
  return dedupeMedications(meds);
}

export async function fetchDoseLogsClient(limit = 200): Promise<DoseLog[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('dose_logs')
    .select('*, medications(name), patients(name)')
    .order('logged_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchDoseLogsClient:', error.message);
    throw new Error(error.message);
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    medication_id: row.medication_id as string,
    patient_id: row.patient_id as string,
    scheduled_time_of_day: row.scheduled_time_of_day as TimeOfDay,
    status: row.status as 'taken' | 'skipped' | 'missed',
    logged_at: row.logged_at as string,
    medication_name: (row.medications as { name?: string } | null)?.name,
    patient_name: (row.patients as { name?: string } | null)?.name,
  }));
}
