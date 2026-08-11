import type { Medication, TimeOfDay } from '@/lib/types';
import { TIME_BLOCK_ORDER, TIME_BLOCK_WINDOWS } from '@/lib/time-blocks';

export interface MedicationInventoryGroup {
  patient_id: string;
  name: string;
  /** Earliest time slot — used as the edit target */
  primary: Medication;
  entries: Medication[];
  timeSlots: TimeOfDay[];
}

export function medicationGroupKey(med: Pick<Medication, 'patient_id' | 'name'>): string {
  return `${med.patient_id}|${med.name.trim().toLowerCase()}`;
}

/** One inventory card per physical medication (shared bottle across time slots). */
export function groupMedicationsForInventory(medications: Medication[]): MedicationInventoryGroup[] {
  const map = new Map<string, Medication[]>();

  for (const med of medications) {
    const key = medicationGroupKey(med);
    const list = map.get(key) ?? [];
    list.push(med);
    map.set(key, list);
  }

  return Array.from(map.values())
    .map(entries => {
      const sorted = [...entries].sort(
        (a, b) => TIME_BLOCK_ORDER.indexOf(a.time_of_day) - TIME_BLOCK_ORDER.indexOf(b.time_of_day),
      );
      return {
        patient_id: sorted[0].patient_id,
        name: sorted[0].name,
        primary: sorted[0],
        entries: sorted,
        timeSlots: sorted.map(e => e.time_of_day),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Shared bottle — slots should match; use max in case they drifted. */
export function getSharedStock(entries: Medication[]): number {
  return Math.max(0, ...entries.map(e => e.current_stock));
}

export function formatMedicationSchedule(slots: TimeOfDay[]): string {
  if (slots.length === 1) return TIME_BLOCK_WINDOWS[slots[0]].label;
  const labels = slots.map(s => TIME_BLOCK_WINDOWS[s].label);
  return `${slots.length}× daily · ${labels.join(', ')}`;
}
