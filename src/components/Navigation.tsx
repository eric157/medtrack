'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, HeartHandshake, LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { InstallGuideLink } from '@/components/InstallPrompt';
import { useMedications, usePatients } from '@/lib/queries/use-medtrack';
import { calculateDepletionForecast } from '@/lib/forecasting';
import { groupMedicationsForInventory, getSharedStock } from '@/lib/group-medications';
import { signOutAction } from '@/lib/actions/medtrack-actions';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const pathname = usePathname();
  const { data: medications = [] } = useMedications();
  const { data: patients = [] } = usePatients();

  const lowStockCount = groupMedicationsForInventory(medications.filter(m => m.is_active)).filter(group => {
    const patient = patients.find(p => p.id === group.patient_id);
    const stock = getSharedStock(group.entries);
    return calculateDepletionForecast({ ...group.primary, current_stock: stock }, patient?.name ?? '').isLowStock;
  }).length;

  const isDashboard = pathname.startsWith('/dashboard');

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
                isDashboard
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

          {isDashboard && (
            <form action={signOutAction}>
              <Button variant="ghost" size="sm" type="submit" title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          )}

            <div className="hidden sm:block pl-1 border-l border-slate-200 dark:border-slate-700">
              <InstallGuideLink />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
