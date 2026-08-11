export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface Patient {
  id: string;
  name: string;
  created_at?: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage_per_take: number;
  time_of_day: TimeOfDay;
  current_stock: number;
  pack_size: number;
  daily_frequency: number;
  low_stock_threshold_days: number;
  is_active: boolean;
  updated_at?: string;
}

export interface DoseLog {
  id: string;
  medication_id: string;
  patient_id: string;
  scheduled_time_of_day: TimeOfDay;
  status: 'taken' | 'skipped' | 'missed';
  logged_at: string;
  medication_name?: string;
  patient_name?: string;
}

export interface DepletionForecast {
  medicationId: string;
  medicationName: string;
  patientName: string;
  currentStock: number;
  dosagePerTake: number;
  dailyFrequency: number;
  daysLeft: number;
  depletionDate: string; // YYYY-MM-DD
  isLowStock: boolean;
  refillQuantityNeeded: number; // to reach target days (default 30)
}

export interface TimeBlockConfig {
  id: TimeOfDay;
  label: string;
  icon: string;
  timeRange: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    badgeBg: string;
  };
}
