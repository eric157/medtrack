'use client';

import React, { useState } from 'react';
import { Medication, TimeOfDay } from '@/lib/types';
import { Check, Clock, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { useMedTrackStore } from '@/lib/store';

interface MedicationCardProps {
  medication: Medication;
  timeOfDay: TimeOfDay;
  isTakenToday?: boolean;
}

export function MedicationCard({ medication, timeOfDay }: MedicationCardProps) {
  const { doseLogs, markDose } = useMedTrackStore();
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if taken today
  const todayStr = new Date().toISOString().split('T')[0];
  const lastLogToday = doseLogs.find(
    log =>
      log.medication_id === medication.id &&
      log.logged_at.startsWith(todayStr)
  );

  const isTaken = lastLogToday?.status === 'taken';

  const handleTakeDose = async () => {
    if (isTaken) return;
    setIsAnimating(true);

    // Audio chime synthesis (Web Audio API) for accessible audio feedback
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio context fallback
    }

    await markDose(medication.id, 'taken');

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const handleSkipDose = async () => {
    await markDose(medication.id, 'skipped');
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 border-4 shadow-md ${
        isTaken
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10'
          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:border-slate-400'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Medicine Name & Dosage */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-3">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {medication.name}
            </span>
            {isTaken && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 text-white font-extrabold text-sm rounded-full shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>TAKEN TODAY</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-slate-700 dark:text-slate-300 font-bold text-lg">
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              Dosage: {medication.dosage_per_take} Tab{medication.dosage_per_take > 1 ? 's' : ''}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Stock: {medication.current_stock} left
            </span>
          </div>
        </div>

        {/* Action Button - WCAG AAA 64px+ Extra Large Touch Target */}
        <div className="w-full sm:w-auto flex items-center space-x-3 shrink-0">
          {isTaken ? (
            <div className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-emerald-600/30">
              <Check className="w-8 h-8 stroke-[3]" />
              <span>Dose Logged</span>
            </div>
          ) : (
            <button
              onClick={handleTakeDose}
              disabled={isAnimating}
              className={`kiosk-btn w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all ${
                isAnimating
                  ? 'bg-emerald-500 text-white scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-[1.02]'
              }`}

            >
              {isAnimating ? (
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-9 h-9 animate-checkmark text-white" />
                  <span>Logged!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Check className="w-9 h-9 stroke-[3]" />
                  <span>MARK TAKEN</span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
