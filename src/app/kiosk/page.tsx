'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { usePatients, useMedications, useDoseLogs } from '@/lib/queries/use-medtrack';
import { TimeBlockSection } from '@/components/kiosk/TimeBlockSection';
import { KioskPinGate } from '@/components/auth/KioskPinGate';
import { User, ShieldCheck } from 'lucide-react';
import { useMissedDoseWatcher, useMedtrackClock } from '@/lib/hooks/use-missed-dose-watcher';
import {
  TIME_BLOCK_ORDER,
  getCurrentTimeBlock,
  getTodayKey,
  getMedtrackTimezone,
  hasBlockEnded,
  isLogOnDate,
} from '@/lib/time-blocks';

export default function ParentKioskPage() {
  useMissedDoseWatcher();
  useMedtrackClock();

  const { data: patients = [], isLoading: loadingPatients, isError: patientsError, error: patientsErr } = usePatients();
  const { data: medications = [], isLoading: loadingMeds, isError: medsError, error: medsErr } = useMedications();
  const { data: doseLogs = [] } = useDoseLogs();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const activePatientId = selectedPatientId ?? patients[0]?.id;
  const activePatient = patients.find(p => p.id === activePatientId) ?? patients[0];

  if (loadingPatients || loadingMeds) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-xl font-bold text-slate-600 dark:text-slate-300 animate-pulse">
          Loading schedule from database...
        </div>
      </div>
    );
  }

  if (patientsError || medsError) {
    const msg = (patientsErr as Error)?.message || (medsErr as Error)?.message || 'Unknown error';
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <p className="text-lg font-bold text-rose-600">Could not load medications</p>
          <p className="text-sm text-slate-600">{msg}</p>
          <p className="text-xs text-slate-500">
            Fix: restart dev server after editing .env.local → stop terminal (Ctrl+C) → run <code className="bg-slate-200 px-1 rounded">npm run dev</code>
          </p>
          <a href="/setup" className="inline-block text-emerald-600 font-semibold hover:underline">Check setup →</a>
        </div>
      </div>
    );
  }

  if (!activePatient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-lg text-muted-foreground">No patients configured. Run Supabase seed migration.</p>
      </div>
    );
  }

  const patientMeds = medications.filter(m => m.patient_id === activePatient.id && m.is_active);
  const timeZone = getMedtrackTimezone();
  const now = new Date();
  const todayKey = getTodayKey(now, timeZone);
  const currentBlock = getCurrentTimeBlock(now, timeZone);

  const todayLogs = doseLogs.filter(
    log => log.patient_id === activePatient.id && isLogOnDate(log, todayKey, timeZone),
  );
  const takenCount = todayLogs.filter(l => l.status === 'taken').length;
  const missedCount = todayLogs.filter(l => l.status === 'missed').length
    + patientMeds.filter(med => {
      const log = todayLogs.find(l => l.medication_id === med.id);
      return !log && hasBlockEnded(med.time_of_day, now, timeZone);
    }).length;
  const totalScheduled = patientMeds.length;
  const percentComplete = totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 0;

  return (
    <KioskPinGate>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-16">
        <div className="bg-slate-900 text-white border-b-4 border-amber-500 py-6 px-4 sm:px-8 shadow-md">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1">
              <div className="inline-flex items-center space-x-2 text-amber-400 font-extrabold text-lg tracking-wide uppercase">
                <span>Parent Kiosk Mode</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                Daily Medicine Schedule
              </h1>
              <p className="text-slate-300 font-semibold text-lg">
                Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              {patients.map(patient => {
                const isSelected = patient.id === activePatient.id;
                return (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`flex-1 md:flex-initial kiosk-btn px-8 py-5 rounded-2xl text-2xl font-black transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/30 scale-105 ring-4 ring-amber-300'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-2 border-slate-700'
                    }`}
                  >
                    <User className="w-8 h-8 mr-3 stroke-[2.5]" />
                    <span>{patient.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-3 border-slate-300 dark:border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
                {activePatient.name}&apos;s Progress Today:
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {takenCount} of {totalScheduled} Taken ({percentComplete}%)
              </span>
            </div>
            {missedCount > 0 && (
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {missedCount} dose{missedCount > 1 ? 's' : ''} missed today — caregiver has been notified.
              </p>
            )}
            <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-300 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          <div className="space-y-8">
            {TIME_BLOCK_ORDER.map(block => (
              <TimeBlockSection
                key={block}
                timeBlock={block}
                medications={patientMeds.filter(m => m.time_of_day === block)}
                isActive={currentBlock === block}
                isPast={hasBlockEnded(block, now, timeZone) && currentBlock !== block}
              />
            ))}
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-slate-300 dark:border-slate-800 text-sm text-slate-500">
            <span className="font-semibold text-slate-400 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Supabase Real-time Sync Active</span>
            </span>
          </div>
        </div>
      </div>
    </KioskPinGate>
  );
}
