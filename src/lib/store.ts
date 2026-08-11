import { create } from 'zustand';
import { Patient, Medication, DoseLog, TimeOfDay } from './types';
import { supabase } from './supabase';

const SEED_PATIENTS: Patient[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Father' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Mother' }
];

// Exact Real-World Inventory Data
const REAL_MEDICATIONS: Medication[] = [
  // Father - Morning
  { id: 'med-f-m1', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Telma H', dosage_per_take: 1, time_of_day: 'morning', current_stock: 12, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 15, is_active: true },
  { id: 'med-f-m2', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Multivitamin Mens 50+', dosage_per_take: 1, time_of_day: 'morning', current_stock: 0, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 15, is_active: true },
  { id: 'med-f-m3', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Voglibose', dosage_per_take: 1, time_of_day: 'morning', current_stock: 125, pack_size: 30, daily_frequency: 2, low_stock_threshold_days: 15, is_active: true },
  { id: 'med-f-m4', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Tolkem SR 450', dosage_per_take: 1, time_of_day: 'morning', current_stock: 10, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 15, is_active: true },
  { id: 'med-f-m5', patient_id: '11111111-1111-1111-1111-111111111111', name: 'B12', dosage_per_take: 1, time_of_day: 'morning', current_stock: 19, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 15, is_active: true },

  // Father - Afternoon
  { id: 'med-f-a1', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Glycomet GP 1', dosage_per_take: 1, time_of_day: 'afternoon', current_stock: 11, pack_size: 30, daily_frequency: 2, low_stock_threshold_days: 15, is_active: true },

  // Father - Evening
  { id: 'med-f-e1', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Glycomet GP 1', dosage_per_take: 1, time_of_day: 'evening', current_stock: 11, pack_size: 30, daily_frequency: 2, low_stock_threshold_days: 15, is_active: true },

  // Father - Night
  { id: 'med-f-n1', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Telma AM', dosage_per_take: 1, time_of_day: 'night', current_stock: 23, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 15, is_active: true },
  { id: 'med-f-n2', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Voglibose', dosage_per_take: 1, time_of_day: 'night', current_stock: 125, pack_size: 30, daily_frequency: 2, low_stock_threshold_days: 15, is_active: true },
  { id: 'med-f-n3', patient_id: '11111111-1111-1111-1111-111111111111', name: 'Atorvastatin', dosage_per_take: 1, time_of_day: 'night', current_stock: 26, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 15, is_active: true },

  // Mother - Morning
  { id: 'med-m-m1', patient_id: '22222222-2222-2222-2222-222222222222', name: 'Telma AM', dosage_per_take: 1, time_of_day: 'morning', current_stock: 33, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 15, is_active: true },
  { id: 'med-m-m2', patient_id: '22222222-2222-2222-2222-222222222222', name: 'Metfine XL 50', dosage_per_take: 1, time_of_day: 'morning', current_stock: 12, pack_size: 30, daily_frequency: 1, low_stock_threshold_days: 15, is_active: true }
];

export interface KeepPurchaseItem {
  medicationName: string;
  packs: number;
}

export const KEEP_PURCHASE_LIST: KeepPurchaseItem[] = [
  { medicationName: 'Multivitamin mens 50+', packs: 1 },
  { medicationName: 'Glycomet-GP 1', packs: 3 },
  { medicationName: 'Tolkem SR 450', packs: 2 },
  { medicationName: 'Telma H', packs: 2 },
  { medicationName: 'Metfine XL 50', packs: 2 }
];

interface MedTrackState {
  patients: Patient[];
  medications: Medication[];
  doseLogs: DoseLog[];
  selectedPatientId: string;
  autoDecrementEnabled: boolean;
  isLoaded: boolean;

  // Actions
  setSelectedPatientId: (id: string) => void;
  toggleAutoDecrement: () => void;
  markDose: (medicationId: string, status: 'taken' | 'skipped') => Promise<void>;
  updateMedicationStock: (medicationId: string, newStock: number) => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  editMedication: (medication: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  refillAllMedsToTarget: (targetDays?: number) => Promise<void>;
  applyKeepPurchaseList: () => Promise<void>;
  runAutoDecrementEngine: () => void;
  resetToRealData: () => void;
  loadState: () => void;
}

export const useMedTrackStore = create<MedTrackState>((set, get) => ({
  patients: SEED_PATIENTS,
  medications: REAL_MEDICATIONS,
  doseLogs: [],
  selectedPatientId: SEED_PATIENTS[0].id,
  autoDecrementEnabled: true,
  isLoaded: false,

  setSelectedPatientId: (id: string) => {
    set({ selectedPatientId: id });
  },

  toggleAutoDecrement: () => {
    const nextState = !get().autoDecrementEnabled;
    set({ autoDecrementEnabled: nextState });
    if (typeof window !== 'undefined') {
      localStorage.setItem('medtrack_auto_decrement', JSON.stringify(nextState));
    }
  },

  loadState: () => {
    if (typeof window === 'undefined') return;

    try {
      const savedPatients = localStorage.getItem('medtrack_patients');
      const savedMeds = localStorage.getItem('medtrack_medications');
      const savedLogs = localStorage.getItem('medtrack_logs');
      const savedAutoDec = localStorage.getItem('medtrack_auto_decrement');

      const loadedState = {
        patients: savedPatients ? JSON.parse(savedPatients) : SEED_PATIENTS,
        medications: savedMeds ? JSON.parse(savedMeds) : REAL_MEDICATIONS,
        doseLogs: savedLogs ? JSON.parse(savedLogs) : [],
        autoDecrementEnabled: savedAutoDec !== null ? JSON.parse(savedAutoDec) : true,
        isLoaded: true
      };

      set(loadedState);

      // Run Auto-Decrement Scheduled Engine on load
      setTimeout(() => {
        get().runAutoDecrementEngine();
      }, 500);
    } catch (e) {
      console.warn('Failed to load state from localStorage, using real data', e);
      set({ isLoaded: true });
    }
  },

  /**
   * Auto-Decrement Scheduled Engine
   * Evaluates time blocks passed today. If a scheduled time block cut-off
   * has passed and no manual log exists for today, automatically creates
   * an auto-logged dose record and decrements stock.
   */
  runAutoDecrementEngine: () => {
    const state = get();
    if (!state.autoDecrementEnabled) return;

    const now = new Date();
    const currentHour = now.getHours();
    const todayStr = now.toISOString().split('T')[0];

    // Cut-off hours for time blocks:
    // Morning cut-off: 11:00 AM (hour >= 11)
    // Afternoon cut-off: 3:00 PM (hour >= 15)
    // Evening cut-off: 8:00 PM (hour >= 20)
    // Night cut-off: 11:59 PM (hour >= 23)
    const passedBlocks: Record<TimeOfDay, boolean> = {
      morning: currentHour >= 11,
      afternoon: currentHour >= 15,
      evening: currentHour >= 20,
      night: currentHour >= 23
    };

    let updatedMeds = [...state.medications];
    let newLogs: DoseLog[] = [];

    updatedMeds = updatedMeds.map(med => {
      if (!med.is_active || med.current_stock <= 0) return med;

      const blockPassed = passedBlocks[med.time_of_day];
      if (!blockPassed) return med;

      // Check if logged today
      const alreadyLogged = state.doseLogs.some(
        log => log.medication_id === med.id && log.logged_at.startsWith(todayStr)
      );

      if (!alreadyLogged) {
        const patient = state.patients.find(p => p.id === med.patient_id);
        const patientName = patient ? patient.name : 'Patient';

        const autoLog: DoseLog = {
          id: 'auto-log-' + med.id + '-' + todayStr,
          medication_id: med.id,
          patient_id: med.patient_id,
          scheduled_time_of_day: med.time_of_day,
          status: 'taken',
          logged_at: new Date().toISOString(),
          medication_name: med.name,
          patient_name: patientName
        };

        newLogs.push(autoLog);

        const newStock = Math.max(0, med.current_stock - med.dosage_per_take);
        return { ...med, current_stock: newStock, updated_at: new Date().toISOString() };
      }

      return med;
    });

    if (newLogs.length > 0) {
      const combinedLogs = [...newLogs, ...state.doseLogs];
      set({
        medications: updatedMeds,
        doseLogs: combinedLogs
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('medtrack_medications', JSON.stringify(updatedMeds));
        localStorage.setItem('medtrack_logs', JSON.stringify(combinedLogs));
      }
    }
  },

  markDose: async (medicationId: string, status: 'taken' | 'skipped') => {
    const state = get();
    const targetMed = state.medications.find(m => m.id === medicationId);
    if (!targetMed) return;

    const patient = state.patients.find(p => p.id === targetMed.patient_id);
    const patientName = patient ? patient.name : 'Patient';

    const newLog: DoseLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      medication_id: medicationId,
      patient_id: targetMed.patient_id,
      scheduled_time_of_day: targetMed.time_of_day,
      status,
      logged_at: new Date().toISOString(),
      medication_name: targetMed.name,
      patient_name: patientName
    };

    const updatedMeds = state.medications.map(med => {
      if (med.id === medicationId && status === 'taken') {
        const newStock = Math.max(0, med.current_stock - med.dosage_per_take);
        return { ...med, current_stock: newStock, updated_at: new Date().toISOString() };
      }
      return med;
    });

    const updatedLogs = [newLog, ...state.doseLogs];

    set({
      medications: updatedMeds,
      doseLogs: updatedLogs
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('medtrack_medications', JSON.stringify(updatedMeds));
      localStorage.setItem('medtrack_logs', JSON.stringify(updatedLogs));
    }

    if (supabase) {
      try {
        await supabase.from('dose_logs').insert([{
          medication_id: medicationId,
          patient_id: targetMed.patient_id,
          scheduled_time_of_day: targetMed.time_of_day,
          status,
          logged_at: newLog.logged_at
        }]);
      } catch (err) {
        console.error('Supabase dose log insert error:', err);
      }
    }
  },

  updateMedicationStock: async (medicationId: string, newStock: number) => {
    const state = get();
    const updatedMeds = state.medications.map(m =>
      m.id === medicationId ? { ...m, current_stock: newStock, updated_at: new Date().toISOString() } : m
    );

    set({ medications: updatedMeds });

    if (typeof window !== 'undefined') {
      localStorage.setItem('medtrack_medications', JSON.stringify(updatedMeds));
    }

    if (supabase) {
      try {
        await supabase.from('medications').update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq('id', medicationId);
      } catch (err) {
        console.error('Supabase stock update error:', err);
      }
    }
  },

  addMedication: async (medData) => {
    const state = get();
    const newMed: Medication = {
      ...medData,
      id: 'med-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      updated_at: new Date().toISOString()
    };

    const updatedMeds = [...state.medications, newMed];
    set({ medications: updatedMeds });

    if (typeof window !== 'undefined') {
      localStorage.setItem('medtrack_medications', JSON.stringify(updatedMeds));
    }

    if (supabase) {
      try {
        await supabase.from('medications').insert([newMed]);
      } catch (err) {
        console.error('Supabase add medication error:', err);
      }
    }
  },

  editMedication: async (updatedMed: Medication) => {
    const state = get();
    const updatedMeds = state.medications.map(m => m.id === updatedMed.id ? { ...updatedMed, updated_at: new Date().toISOString() } : m);
    set({ medications: updatedMeds });

    if (typeof window !== 'undefined') {
      localStorage.setItem('medtrack_medications', JSON.stringify(updatedMeds));
    }

    if (supabase) {
      try {
        await supabase.from('medications').update(updatedMed).eq('id', updatedMed.id);
      } catch (err) {
        console.error('Supabase edit medication error:', err);
      }
    }
  },

  deleteMedication: async (id: string) => {
    const state = get();
    const updatedMeds = state.medications.filter(m => m.id !== id);
    set({ medications: updatedMeds });

    if (typeof window !== 'undefined') {
      localStorage.setItem('medtrack_medications', JSON.stringify(updatedMeds));
    }

    if (supabase) {
      try {
        await supabase.from('medications').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete medication error:', err);
      }
    }
  },

  refillAllMedsToTarget: async (targetDays: number = 30) => {
    const state = get();
    const updatedMeds = state.medications.map(med => {
      const dailyConsumption = Math.max(1, med.daily_frequency * med.dosage_per_take);
      const targetStock = targetDays * dailyConsumption;
      return {
        ...med,
        current_stock: Math.max(med.current_stock, targetStock),
        updated_at: new Date().toISOString()
      };
    });

    set({ medications: updatedMeds });

    if (typeof window !== 'undefined') {
      localStorage.setItem('medtrack_medications', JSON.stringify(updatedMeds));
    }
  },

  applyKeepPurchaseList: async () => {
    const state = get();
    const updatedMeds = state.medications.map(med => {
      let addPills = 0;
      const lowerName = med.name.toLowerCase();

      if (lowerName.includes('multivitamin')) addPills = 1 * med.pack_size;
      else if (lowerName.includes('glycomet')) addPills = 3 * med.pack_size;
      else if (lowerName.includes('tolkem')) addPills = 2 * med.pack_size;
      else if (lowerName.includes('telma h')) addPills = 2 * med.pack_size;
      else if (lowerName.includes('metfine')) addPills = 2 * med.pack_size;

      if (addPills > 0) {
        return {
          ...med,
          current_stock: med.current_stock + addPills,
          updated_at: new Date().toISOString()
        };
      }
      return med;
    });

    set({ medications: updatedMeds });

    if (typeof window !== 'undefined') {
      localStorage.setItem('medtrack_medications', JSON.stringify(updatedMeds));
    }
  },

  resetToRealData: () => {
    set({
      patients: SEED_PATIENTS,
      medications: REAL_MEDICATIONS,
      doseLogs: []
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medtrack_patients');
      localStorage.removeItem('medtrack_medications');
      localStorage.removeItem('medtrack_logs');
    }
  }
}));
