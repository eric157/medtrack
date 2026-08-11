'use client';

import React, { useState } from 'react';
import { Medication } from '@/lib/types';
import { Check, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useDoseLogs, useLogDose } from '@/lib/queries/use-medtrack';
import { getKioskPin } from '@/components/auth/KioskPinGate';
import { getMedicationDoseStatus } from '@/lib/time-blocks';
import { useMedtrackClock } from '@/lib/hooks/use-missed-dose-watcher';

interface MedicationCardProps {
  medication: Medication;
}

const STATUS_STYLES = {
  taken: {
    card: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-950 dark:text-emerald-100',
    badge: 'bg-emerald-600 text-white',
    badgeText: 'TAKEN TODAY',
  },
  missed: {
    card: 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/80 text-rose-950 dark:text-rose-100',
    badge: 'bg-rose-600 text-white',
    badgeText: 'MISSED TODAY',
  },
  overdue: {
    card: 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/80 text-amber-950 dark:text-amber-100',
    badge: 'bg-amber-600 text-white',
    badgeText: 'OVERDUE',
  },
  due: {
    card: 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-600 text-slate-900 dark:text-white ring-2 ring-emerald-400/50',
    badge: 'bg-emerald-600 text-white',
    badgeText: 'DUE NOW',
  },
  upcoming: {
    card: 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white opacity-80',
    badge: '',
    badgeText: '',
  },
  skipped: {
    card: 'bg-slate-100 dark:bg-slate-900 border-slate-400 text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-600 text-white',
    badgeText: 'SKIPPED',
  },
} as const;

export function MedicationCard({ medication }: MedicationCardProps) {
  useMedtrackClock();
  const { data: doseLogs = [] } = useDoseLogs();
  const logDose = useLogDose();
  const [isAnimating, setIsAnimating] = useState(false);

  const doseStatus = getMedicationDoseStatus(medication, doseLogs);
  const styles = STATUS_STYLES[doseStatus];
  const canMarkTaken = doseStatus !== 'taken' && doseStatus !== 'skipped';

  const handleTakeDose = async () => {
    if (!canMarkTaken || logDose.isPending) return;
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
    <div className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 border-4 shadow-md ${styles.card}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">{medication.name}</span>
            {styles.badgeText && (
              <span className={`inline-flex items-center space-x-1 px-3 py-1 font-extrabold text-sm rounded-full ${styles.badge}`}>
                {doseStatus === 'missed' || doseStatus === 'overdue' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : doseStatus === 'due' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{styles.badgeText}</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 text-slate-700 dark:text-slate-300 font-bold text-lg flex-wrap gap-2">
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border">
              Dosage: {medication.dosage_per_take} Tab{medication.dosage_per_take > 1 ? 's' : ''}
            </span>
            <span className="text-sm text-slate-500">Stock: {medication.current_stock} left</span>
          </div>
          {(doseStatus === 'overdue' || doseStatus === 'missed') && (
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
              Parent did not mark this dose before the time window ended.
            </p>
          )}
        </div>

        <div className="w-full sm:w-auto shrink-0">
          {doseStatus === 'taken' ? (
            <div className="flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xl">
              <Check className="w-8 h-8 stroke-[3]" />
              <span>Dose Logged</span>
            </div>
          ) : canMarkTaken ? (
            <button
              onClick={handleTakeDose}
              disabled={isAnimating || logDose.isPending}
              className={`kiosk-btn w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all ${
                isAnimating
                  ? 'bg-emerald-500 text-white scale-105'
                  : doseStatus === 'overdue' || doseStatus === 'missed'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
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
                  <span>{doseStatus === 'missed' || doseStatus === 'overdue' ? 'MARK TAKEN (LATE)' : 'MARK TAKEN'}</span>
                </span>
              )}
            </button>
          ) : (
            <div className="px-6 py-4 bg-slate-500 text-white rounded-2xl font-black text-xl text-center">
              Skipped
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
