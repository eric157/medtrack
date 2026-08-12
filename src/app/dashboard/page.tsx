'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { usePatients, useMedications, useDoseLogs } from '@/lib/queries/use-medtrack';
import { calculateDepletionForecast } from '@/lib/forecasting';
import { Medication } from '@/lib/types';
import { ComplianceFeed } from '@/components/dashboard/ComplianceFeed';
import { InventoryOverview } from '@/components/dashboard/InventoryOverview';
import { AddEditMedicationModal } from '@/components/dashboard/AddEditMedicationModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Plus, AlertTriangle, CheckCircle2, Package, Users, Filter,
} from 'lucide-react';
import { useMedtrackClock, useCaregiverAutoTakenWatcher } from '@/lib/hooks/use-missed-dose-watcher';
import { getMedtrackTimezone, getTodayKey, isLogOnDate } from '@/lib/time-blocks';
import { groupMedicationsForInventory, getSharedStock } from '@/lib/group-medications';

export default function CaregiverDashboardPage() {
  useMedtrackClock();
  useCaregiverAutoTakenWatcher();

  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const { data: medications = [], isLoading: loadingMeds } = useMedications();
  const { data: doseLogs = [] } = useDoseLogs();

  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('all');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);

  if (loadingPatients || loadingMeds) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-xl font-bold text-slate-600 dark:text-slate-300 animate-pulse">
          Loading from Supabase...
        </div>
      </div>
    );
  }

  const filteredMeds = selectedPatientFilter === 'all'
    ? medications.filter(m => m.is_active)
    : medications.filter(m => m.patient_id === selectedPatientFilter && m.is_active);

  const inventoryGroups = groupMedicationsForInventory(medications.filter(m => m.is_active));

  const lowStockItems = inventoryGroups.filter(group => {
    const patient = patients.find(p => p.id === group.patient_id);
    const stock = getSharedStock(group.entries);
    return calculateDepletionForecast({ ...group.primary, current_stock: stock }, patient?.name ?? '').isLowStock;
  });

  const timeZone = getMedtrackTimezone();
  const now = new Date();
  const todayKey = getTodayKey(now, timeZone);
  const todayLogs = doseLogs.filter(log => isLogOnDate(log, todayKey, timeZone));
  const dosesTakenToday = todayLogs.filter(l => l.status === 'taken').length;
  const dosesMissedToday = todayLogs.filter(l => l.status === 'missed').length;
  const totalDailyScheduled = medications.filter(m => m.is_active).length;
  const compliancePercent = totalDailyScheduled > 0
    ? Math.min(100, Math.round((dosesTakenToday / totalDailyScheduled) * 100))
    : 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <div className="bg-slate-900 text-white border-b-4 border-indigo-600 py-8 px-4 sm:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-indigo-400 font-extrabold text-xs uppercase tracking-widest">
              <LayoutDashboard className="w-4 h-4" />
              <span>Primary Caregiver Control Center</span>
              <Badge variant="secondary" className="text-[10px]">Live Sync</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Medication Dashboard
            </h1>
            <p className="text-slate-300 text-sm">
              Supabase Realtime · Live compliance tracking
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => { setMedicationToEdit(null); setIsAddEditModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-500 font-extrabold">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase">Medications</p>
              <h3 className="text-3xl font-black mt-1">{inventoryGroups.length}</h3>
            </div>
            <Package className="w-7 h-7 text-indigo-500" />
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${lowStockItems.length > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white dark:bg-slate-900'}`}>
            <div>
              <p className="text-xs font-extrabold text-amber-700 uppercase">Low Stock</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{lowStockItems.length}</h3>
            </div>
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase">Doses Today</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{dosesTakenToday}</h3>
              {dosesMissedToday > 0 && (
                <p className="text-xs font-bold text-rose-600 mt-1">{dosesMissedToday} missed</p>
              )}
            </div>
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase">Compliance</p>
              <h3 className="text-3xl font-black mt-1">{compliancePercent}%</h3>
            </div>
            <Users className="w-7 h-7 text-blue-500" />
          </div>
        </div>

        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase">Filter Patient</span>
          </div>
          <div className="flex items-center space-x-2">
            {['all', ...patients.map(p => p.id)].map(id => (
              <button
                key={id}
                onClick={() => setSelectedPatientFilter(id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  selectedPatientFilter === id ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-slate-100'
                }`}
              >
                {id === 'all' ? 'All' : patients.find(p => p.id === id)?.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ComplianceFeed doseLogs={doseLogs} />
          </div>
          <div className="lg:col-span-2">
            <InventoryOverview
              medications={filteredMeds}
              patients={patients}
              onEditMedication={med => { setMedicationToEdit(med); setIsAddEditModalOpen(true); }}
            />
          </div>
        </div>
      </div>

      <AddEditMedicationModal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)} medicationToEdit={medicationToEdit} patients={patients} />
    </div>
  );
}
