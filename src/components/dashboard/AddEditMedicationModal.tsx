'use client';

import React, { useState, useEffect } from 'react';
import { Medication, Patient, TimeOfDay } from '@/lib/types';
import { useMedTrackStore } from '@/lib/store';
import { PlusCircle, Edit3, Save } from 'lucide-react';

interface AddEditMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationToEdit?: Medication | null;
  patients: Patient[];
}

export function AddEditMedicationModal({
  isOpen,
  onClose,
  medicationToEdit,
  patients
}: AddEditMedicationModalProps) {
  const { addMedication, editMedication } = useMedTrackStore();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [name, setName] = useState('');
  const [dosagePerTake, setDosagePerTake] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [currentStock, setCurrentStock] = useState(30);
  const [packSize, setPackSize] = useState(30);
  const [dailyFrequency, setDailyFrequency] = useState(1);
  const [lowStockThresholdDays, setLowStockThresholdDays] = useState(5);

  useEffect(() => {
    if (medicationToEdit) {
      setPatientId(medicationToEdit.patient_id);
      setName(medicationToEdit.name);
      setDosagePerTake(medicationToEdit.dosage_per_take);
      setTimeOfDay(medicationToEdit.time_of_day);
      setCurrentStock(medicationToEdit.current_stock);
      setPackSize(medicationToEdit.pack_size);
      setDailyFrequency(medicationToEdit.daily_frequency);
      setLowStockThresholdDays(medicationToEdit.low_stock_threshold_days);
    } else {
      setPatientId(patients[0]?.id || '');
      setName('');
      setDosagePerTake(1);
      setTimeOfDay('morning');
      setCurrentStock(30);
      setPackSize(30);
      setDailyFrequency(1);
      setLowStockThresholdDays(5);
    }
  }, [medicationToEdit, patients, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (medicationToEdit) {
      await editMedication({
        ...medicationToEdit,
        patient_id: patientId,
        name: name.trim(),
        dosage_per_take: Number(dosagePerTake),
        time_of_day: timeOfDay,
        current_stock: Number(currentStock),
        pack_size: Number(packSize),
        daily_frequency: Number(dailyFrequency),
        low_stock_threshold_days: Number(lowStockThresholdDays)
      });
    } else {
      await addMedication({
        patient_id: patientId,
        name: name.trim(),
        dosage_per_take: Number(dosagePerTake),
        time_of_day: timeOfDay,
        current_stock: Number(currentStock),
        pack_size: Number(packSize),
        daily_frequency: Number(dailyFrequency),
        low_stock_threshold_days: Number(lowStockThresholdDays),
        is_active: true
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {medicationToEdit ? <Edit3 className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {medicationToEdit ? 'Edit Medication' : 'Add New Medication'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Select Patient
            </label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Medication Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Telma AM, Glycomet GP"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Time Block & Dosage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Time Block
              </label>
              <select
                value={timeOfDay}
                onChange={e => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="morning">Morning 🌅</option>
                <option value="afternoon">Afternoon ☀️</option>
                <option value="evening">Evening 🌆</option>
                <option value="night">Night 🌙</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Dosage per Take
              </label>
              <input
                type="number"
                min="1"
                required
                value={dosagePerTake}
                onChange={e => setDosagePerTake(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Current Stock & Pack Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Current Stock (Pills)
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentStock}
                onChange={e => setCurrentStock(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Pack Size
              </label>
              <input
                type="number"
                min="1"
                required
                value={packSize}
                onChange={e => setPackSize(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Daily Frequency & Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Daily Frequency
              </label>
              <input
                type="number"
                min="1"
                required
                value={dailyFrequency}
                onChange={e => setDailyFrequency(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Low Stock Alert (Days)
              </label>
              <input
                type="number"
                min="1"
                required
                value={lowStockThresholdDays}
                onChange={e => setLowStockThresholdDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{medicationToEdit ? 'Save Changes' : 'Create Medication'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
