import type { Patient, Medication } from '@/lib/types';

export const SEED_PATIENTS: Patient[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Father' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Mother' },
];

export const SEED_MEDICATIONS: Medication[] = [
  { id: 'med-f-m1', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Telma H', dosage_per_take: 1, time_of_day: 'morning', current_stock: 12, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-f-m2', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Multivitamin Mens 50+', dosage_per_take: 1, time_of_day: 'morning', current_stock: 0, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-f-m3', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Voglibose', dosage_per_take: 1, time_of_day: 'morning', current_stock: 125, pack_size: 30, daily_frequency: 2, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-f-m4', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Tolkem SR 450', dosage_per_take: 1, time_of_day: 'morning', current_stock: 10, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-f-m5', patient_id: '11111111-1111-1111-1111-111111111111', name: 'B12', dosage_per_take: 1, time_of_day: 'morning', current_stock: 19, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-f-a1', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Glycomet GP 1', dosage_per_take: 1, time_of_day: 'afternoon', current_stock: 11, pack_size: 30, daily_frequency: 2, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-f-e1', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Glycomet GP 1', dosage_per_take: 1, time_of_day: 'evening', current_stock: 11, pack_size: 30, daily_frequency: 2, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-f-n1', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Telma AM', dosage_per_take: 1, time_of_day: 'night', current_stock: 23, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-f-n2', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Voglibose', dosage_per_take: 1, time_of_day: 'night', current_stock: 125, pack_size: 30, daily_frequency: 2, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-f-n3', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Atorvastatin', dosage_per_take: 1, time_of_day: 'night', current_stock: 26, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-m-m1', patient_id: '22222222-2222-2222-2222-222222222222', name: 'Telma AM', dosage_per_take: 1, time_of_day: 'morning', current_stock: 33, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 5, is_active: true },
  { id: 'med-m-m2', patient_id: '22222222-2222-2222-2222-222222222222', name: 'Metfine XL 50', dosage_per_take: 1, time_of_day: 'morning', current_stock: 12, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 5, is_active: true },
];

export const KEEP_PURCHASE_LIST = [
  { medicationName: 'Multivitamin mens 50+', packs: 1 },
  { medicationName: 'Glycomet-GP 1', packs: 3 },
  { medicationName: 'Tolkem SR 450', packs: 2 },
  { medicationName: 'Telma H', packs: 2 },
  { medicationName: 'Metfine XL 50', packs: 2 },
];
