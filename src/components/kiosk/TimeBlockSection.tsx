'use client';

import React from 'react';
import { Medication, TimeOfDay } from '@/lib/types';
import { MedicationCard } from './MedicationCard';
import { TIME_BLOCK_WINDOWS } from '@/lib/time-blocks';
import { Sun, Sunset, Moon, Sunrise, Clock } from 'lucide-react';

interface TimeBlockSectionProps {
  timeBlock: TimeOfDay;
  medications: Medication[];
  isActive?: boolean;
  isPast?: boolean;
}

export function TimeBlockSection({ timeBlock, medications, isActive, isPast }: TimeBlockSectionProps) {
  const window = TIME_BLOCK_WINDOWS[timeBlock];

  const colorThemes: Record<TimeOfDay, {
    bg: string; border: string; text: string; accent: string; badgeBg: string;
  }> = {
    morning: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      border: 'border-amber-400 dark:border-amber-600',
      text: 'text-amber-700 dark:text-amber-300',
      accent: 'bg-amber-500 text-white',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200',
    },
    afternoon: {
      bg: 'bg-blue-500/10 dark:bg-blue-950/40',
      border: 'border-blue-400 dark:border-blue-600',
      text: 'text-blue-700 dark:text-blue-300',
      accent: 'bg-blue-500 text-white',
      badgeBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200',
    },
    evening: {
      bg: 'bg-orange-500/10 dark:bg-orange-950/40',
      border: 'border-orange-400 dark:border-orange-600',
      text: 'text-orange-700 dark:text-orange-300',
      accent: 'bg-orange-500 text-white',
      badgeBg: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200',
    },
    night: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
      border: 'border-indigo-400 dark:border-indigo-600',
      text: 'text-indigo-700 dark:text-indigo-300',
      accent: 'bg-indigo-600 text-white',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200',
    },
  };

  const theme = colorThemes[timeBlock];

  const renderIcon = () => {
    switch (timeBlock) {
      case 'morning': return <Sunrise className="w-8 h-8 stroke-[2.5]" />;
      case 'afternoon': return <Sun className="w-8 h-8 stroke-[2.5]" />;
      case 'evening': return <Sunset className="w-8 h-8 stroke-[2.5]" />;
      case 'night': return <Moon className="w-8 h-8 stroke-[2.5]" />;
    }
  };

  if (medications.length === 0) return null;

  return (
    <section
      className={`rounded-3xl border-3 p-6 sm:p-8 space-y-6 shadow-lg transition-all ${theme.bg} ${
        isActive
          ? 'border-emerald-500 ring-4 ring-emerald-400/40 scale-[1.01]'
          : isPast
            ? 'border-slate-300 dark:border-slate-700 opacity-90'
            : theme.border
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center space-x-4">
          <div className={`p-4 rounded-2xl ${theme.accent} shadow-md`}>
            {renderIcon()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-3xl sm:text-4xl font-black ${theme.text}`}>
                {window.label}
              </h2>
              {isActive && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-sm font-black rounded-full animate-pulse">
                  <Clock className="w-4 h-4" />
                  NOW
                </span>
              )}
              {isPast && !isActive && (
                <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-black rounded-full">
                  Window closed
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-bold text-base">
              {window.timeRange}
            </p>
          </div>
        </div>

        <div className={`self-start sm:self-auto px-4 py-2 rounded-xl font-black text-lg ${theme.badgeBg}`}>
          {medications.length} Medication{medications.length > 1 ? 's' : ''} Scheduled
        </div>
      </div>

      <div className="space-y-4">
        {medications.map(med => (
          <MedicationCard key={med.id} medication={med} />
        ))}
      </div>
    </section>
  );
}
