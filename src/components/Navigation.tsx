'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, HeartHandshake } from 'lucide-react';
import { useMedTrackStore } from '@/lib/store';
import { calculateDepletionForecast } from '@/lib/forecasting';
import { Logo } from '@/components/Logo';
import { InstallGuideLink } from '@/components/InstallPrompt';

export function Navigation() {
  const pathname = usePathname();
  const { medications, patients, loadState, isLoaded } = useMedTrackStore();

  useEffect(() => {
    if (!isLoaded) {
      loadState();
    }
  }, [isLoaded, loadState]);

  const lowStockCount = medications.filter(med => {
    const patient = patients.find(p => p.id === med.patient_id);
    const forecast = calculateDepletionForecast(med, patient ? patient.name : '');
    return forecast.isLowStock;
  }).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="group hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>

          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/kiosk"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
                pathname.startsWith('/kiosk')
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HeartHandshake className="w-5 h-5" />
              <span className="text-base sm:text-lg">Parent View</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
                pathname.startsWith('/dashboard')
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-base sm:text-lg hidden sm:inline">Caregiver Dashboard</span>
              <span className="sm:hidden">Dashboard</span>

              {lowStockCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-black bg-rose-500 text-white rounded-full animate-pulse">
                  {lowStockCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:block pl-1 border-l border-slate-200 dark:border-slate-700">
              <InstallGuideLink />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
