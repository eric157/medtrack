'use client';

import React, { useState } from 'react';
import { Medication } from '@/lib/types';
import { Check, CheckCircle2 } from 'lucide-react';
import { useDoseLogs, useLogDose } from '@/lib/queries/use-medtrack';
import { getKioskPin } from '@/components/auth/KioskPinGate';

interface MedicationCardProps {
  medication: Medication;
}

export function MedicationCard({ medication }: MedicationCardProps) {
  const { data: doseLogs = [] } = useDoseLogs();
  const logDose = useLogDose();
  const [isAnimating, setIsAnimating] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const lastLogToday = doseLogs.find(
    log => log.medication_id === medication.id && log.logged_at.startsWith(todayStr)
  );
  const isTaken = lastLogToday?.status === 'taken';

  const handleTakeDose = async () => {
    if (isTaken || logDose.isPending) return;
    setIsAnimating(true);

    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // audio optional
    }

    await logDose.mutateAsync({
      medicationId: medication.id,
      status: 'taken',
      kioskPin: getKioskPin() ?? undefined,
    });

    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 border-4 shadow-md ${
        isTaken
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-950 dark:text-emerald-100'
          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-3">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">{medication.name}</span>
            {isTaken && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 text-white font-extrabold text-sm rounded-full">
                <CheckCircle2 className="w-4 h-4" />
                <span>TAKEN TODAY</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 text-slate-700 dark:text-slate-300 font-bold text-lg">
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border">
              Dosage: {medication.dosage_per_take} Tab{medication.dosage_per_take > 1 ? 's' : ''}
            </span>
            <span className="text-sm text-slate-500">Stock: {medication.current_stock} left</span>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          {isTaken ? (
            <div className="flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xl">
              <Check className="w-8 h-8 stroke-[3]" />
              <span>Dose Logged</span>
            </div>
          ) : (
            <button
              onClick={handleTakeDose}
              disabled={isAnimating || logDose.isPending}
              className={`kiosk-btn w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all ${
                isAnimating
                  ? 'bg-emerald-500 text-white scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isAnimating ? (
                <span className="flex items-center space-x-3">
                  <CheckCircle2 className="w-9 h-9 animate-checkmark" />
                  <span>Logged!</span>
                </span>
              ) : (
                <span className="flex items-center space-x-3">
                  <Check className="w-9 h-9 stroke-[3]" />
                  <span>MARK TAKEN</span>
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
