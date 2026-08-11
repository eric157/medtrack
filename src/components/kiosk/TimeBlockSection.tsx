'use client';

import React from 'react';
import { Medication, TimeBlockConfig, TimeOfDay } from '@/lib/types';
import { MedicationCard } from './MedicationCard';
import { Sun, Sunset, Moon, Sunrise, CheckCircle2 } from 'lucide-react';

interface TimeBlockSectionProps {
  timeBlock: TimeOfDay;
  medications: Medication[];
}

const TIME_BLOCK_CONFIGS: Record<TimeOfDay, TimeBlockConfig> = {
  morning: {
    id: 'morning',
    label: 'Morning',
    icon: 'Sunrise',
    timeRange: '7:00 AM - 11:00 AM',
    colorTheme: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      border: 'border-amber-400 dark:border-amber-600',
      text: 'text-amber-700 dark:text-amber-300',
      accent: 'bg-amber-500 text-white',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
    }
  },
  afternoon: {
    id: 'afternoon',
    label: 'Afternoon',
    icon: 'Sun',
    timeRange: '12:00 PM - 3:00 PM',
    colorTheme: {
      bg: 'bg-blue-500/10 dark:bg-blue-950/40',
      border: 'border-blue-400 dark:border-blue-600',
      text: 'text-blue-700 dark:text-blue-300',
      accent: 'bg-blue-500 text-white',
      badgeBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
    }
  },
  evening: {
    id: 'evening',
    label: 'Evening',
    icon: 'Sunset',
    timeRange: '5:00 PM - 8:00 PM',
    colorTheme: {
      bg: 'bg-orange-500/10 dark:bg-orange-950/40',
      border: 'border-orange-400 dark:border-orange-600',
      text: 'text-orange-700 dark:text-orange-300',
      accent: 'bg-orange-500 text-white',
      badgeBg: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200'
    }
  },
  night: {
    id: 'night',
    label: 'Night',
    icon: 'Moon',
    timeRange: '9:00 PM - 11:00 PM',
    colorTheme: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
      border: 'border-indigo-400 dark:border-indigo-600',
      text: 'text-indigo-700 dark:text-indigo-300',
      accent: 'bg-indigo-600 text-white',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200'
    }
  }
};

export function TimeBlockSection({ timeBlock, medications }: TimeBlockSectionProps) {
  const config = TIME_BLOCK_CONFIGS[timeBlock];

  const renderIcon = () => {
    switch (timeBlock) {
      case 'morning': return <Sunrise className="w-8 h-8 stroke-[2.5]" />;
      case 'afternoon': return <Sun className="w-8 h-8 stroke-[2.5]" />;
      case 'evening': return <Sunset className="w-8 h-8 stroke-[2.5]" />;
      case 'night': return <Moon className="w-8 h-8 stroke-[2.5]" />;
    }
  };

  if (medications.length === 0) {
    return null;
  }

  return (
    <section className={`rounded-3xl border-3 ${config.colorTheme.border} ${config.colorTheme.bg} p-6 sm:p-8 space-y-6 shadow-lg`}>
      {/* Time Block Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center space-x-4">
          <div className={`p-4 rounded-2xl ${config.colorTheme.accent} shadow-md`}>
            {renderIcon()}
          </div>
          <div>
            <h2 className={`text-3xl sm:text-4xl font-black ${config.colorTheme.text}`}>
              {config.label}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 font-bold text-base">
              {config.timeRange}
            </p>
          </div>
        </div>

        <div className={`self-start sm:self-auto px-4 py-2 rounded-xl font-black text-lg ${config.colorTheme.badgeBg}`}>
          {medications.length} Medication{medications.length > 1 ? 's' : ''} Scheduled
        </div>
      </div>

      {/* Medication Cards List */}
      <div className="space-y-4">
        {medications.map(med => (
          <MedicationCard key={med.id} medication={med} timeOfDay={timeBlock} />
        ))}
      </div>
    </section>
  );
}
