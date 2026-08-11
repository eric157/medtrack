'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useMedTrackStore } from '@/lib/store';
import { TimeBlockSection } from '@/components/kiosk/TimeBlockSection';
import { User, RotateCcw, ShieldCheck } from 'lucide-react';

export default function ParentKioskPage() {
  const {
    patients,
    medications,
    selectedPatientId,
    setSelectedPatientId,
    doseLogs,
    resetToRealData,
    loadState,
    isLoaded
  } = useMedTrackStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoaded) {
      loadState();
    }
  }, [isLoaded, loadState]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-xl font-bold text-slate-600 dark:text-slate-300 animate-pulse">
          Loading Parent Kiosk Schedule...
        </div>
      </div>
    );
  }

  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientMeds = medications.filter(m => m.patient_id === activePatient.id && m.is_active);

  // Group meds by time of day
  const morningMeds = patientMeds.filter(m => m.time_of_day === 'morning');
  const afternoonMeds = patientMeds.filter(m => m.time_of_day === 'afternoon');
  const eveningMeds = patientMeds.filter(m => m.time_of_day === 'evening');
  const nightMeds = patientMeds.filter(m => m.time_of_day === 'night');

  // Today progress calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = doseLogs.filter(
    log => log.patient_id === activePatient.id && log.logged_at.startsWith(todayStr)
  );

  const takenCount = todayLogs.filter(l => l.status === 'taken').length;
  const totalScheduled = patientMeds.length;
  const percentComplete = totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-16">
      {/* High-Contrast Accessible Banner */}
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

          {/* Profile Switcher Tabs - Extra Large 64px Touch Targets */}
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
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-slate-900 border-2 border-slate-700'
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

      {/* Main Kiosk View Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Daily Progress Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-3 border-slate-300 dark:border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
              {activePatient.name}'s Progress Today:
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {takenCount} of {totalScheduled} Taken ({percentComplete}%)
            </span>
          </div>

          <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-300 dark:border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Time Block Sections */}
        <div className="space-y-8">
          <TimeBlockSection timeBlock="morning" medications={morningMeds} />
          <TimeBlockSection timeBlock="afternoon" medications={afternoonMeds} />
          <TimeBlockSection timeBlock="evening" medications={eveningMeds} />
          <TimeBlockSection timeBlock="night" medications={nightMeds} />
        </div>

        {/* Real Inventory Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-300 dark:border-slate-800 text-sm text-slate-500">
          <button
            onClick={resetToRealData}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
            title="Reset to real stock levels"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Verified Stock Data</span>
          </button>

          <span className="font-semibold text-slate-400 flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Real Inventory Engine Active</span>
          </span>
        </div>
      </div>
    </div>
  );
}
