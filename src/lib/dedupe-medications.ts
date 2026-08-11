import type { Medication } from '@/lib/types';

/** One row per patient + name + time slot (seed re-runs create duplicates in Supabase). */
export function dedupeMedications(medications: Medication[]): Medication[] {
  const bySlot = new Map<string, Medication>();

  for (const med of medications) {
    const key = `${med.patient_id}|${med.name.trim().toLowerCase()}|${med.time_of_day}`;
    const existing = bySlot.get(key);

    if (!existing) {
      bySlot.set(key, med);
      continue;
    }

    const existingUpdated = existing.updated_at ? Date.parse(existing.updated_at) : 0;
    const medUpdated = med.updated_at ? Date.parse(med.updated_at) : 0;
    if (medUpdated >= existingUpdated) {
      bySlot.set(key, med);
    }
  }

  const deduped = Array.from(bySlot.values());
  if (deduped.length < medications.length) {
    console.warn(
      `[MedTrack] Removed ${medications.length - deduped.length} duplicate medication row(s). ` +
        'Re-run supabase/migrations/20260811000002_dedupe_medications.sql to clean the database.',
    );
  }

  return deduped.sort((a, b) => a.name.localeCompare(b.name));
}
