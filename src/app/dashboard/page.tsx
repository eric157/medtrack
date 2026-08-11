'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useMedTrackStore } from '@/lib/store';
import { calculateDepletionForecast } from '@/lib/forecasting';
import { Medication } from '@/lib/types';
import { ComplianceFeed } from '@/components/dashboard/ComplianceFeed';
import { InventoryOverview } from '@/components/dashboard/InventoryOverview';
import { RefillPlannerModal } from '@/components/dashboard/RefillPlannerModal';
import { AddEditMedicationModal } from '@/components/dashboard/AddEditMedicationModal';
import {
  LayoutDashboard,
  Plus,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Package,
  Users,
  Filter
} from 'lucide-react';

export default function CaregiverDashboardPage() {
  const {
    patients,
    medications,
    doseLogs,
    loadState,
    isLoaded
  } = useMedTrackStore();

  const [mounted, setMounted] = useState(false);
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('all');
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isLoaded) {
      loadState();
    }
  }, [isLoaded, loadState]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-xl font-bold text-slate-600 dark:text-slate-300 animate-pulse">
          Loading Caregiver Control Dashboard...
        </div>
      </div>
    );
  }

  // Filtered medications
  const filteredMeds = selectedPatientFilter === 'all'
    ? medications.filter(m => m.is_active)
    : medications.filter(m => m.patient_id === selectedPatientFilter && m.is_active);

  // Stats calculation
  const lowStockItems = medications.filter(med => {
    const patient = patients.find(p => p.id === med.patient_id);
    const forecast = calculateDepletionForecast(med, patient ? patient.name : '');
    return forecast.isLowStock;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = doseLogs.filter(log => log.logged_at.startsWith(todayStr));
  const dosesTakenToday = todayLogs.filter(l => l.status === 'taken').length;

  const totalDailyScheduled = medications.filter(m => m.is_active).length;
  const compliancePercent = totalDailyScheduled > 0
    ? Math.min(100, Math.round((dosesTakenToday / totalDailyScheduled) * 100))
    : 100;

  const handleOpenEdit = (med: Medication) => {
    setMedicationToEdit(med);
    setIsAddEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setMedicationToEdit(null);
    setIsAddEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b-4 border-indigo-600 py-8 px-4 sm:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-indigo-400 font-extrabold text-xs uppercase tracking-widest">
              <LayoutDashboard className="w-4 h-4" />
              <span>Primary Caregiver Control Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Medication & Refill Dashboard
            </h1>
            <p className="text-slate-300 text-sm">
              Real-time monitoring, stock depletion forecasting & Google Tasks refill automation.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsRefillModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm transition-transform shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>30-Day Refill Planner</span>
              {lowStockItems.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 bg-slate-950 text-amber-400 text-xs font-black rounded-full">
                  {lowStockItems.length}
                </span>
              )}
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-sm transition-transform shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Add Medication</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Tracked */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Total Medications
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {medications.length}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Across 2 Patient Profiles</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Package className="w-7 h-7" />
            </div>
          </div>

          {/* Card 2: Low Stock Alerts */}
          <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-colors ${
            lowStockItems.length > 0
              ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div>
              <p className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Low Stock Alerts
              </p>
              <h3 className="text-3xl font-black text-amber-600 dark:text-amber-300 mt-1">
                {lowStockItems.length}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lowStockItems.length > 0 ? 'Requires Refill Soon' : 'All Stocks Healthy'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
          </div>

          {/* Card 3: Today's Completed Doses */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Doses Taken Today
              </p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {dosesTakenToday}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Recorded via Parent Kiosk</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>

          {/* Card 4: Daily Compliance % */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Daily Compliance
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {compliancePercent}%
              </h3>
              <p className="text-xs text-slate-400 mt-1">Based on daily frequency</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Patient Filter Tabs */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Filter Patient:
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedPatientFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                selectedPatientFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              All Patients ({medications.length})
            </button>

            {patients.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientFilter(p.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  selectedPatientFilter === p.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                {p.name} ({medications.filter(m => m.patient_id === p.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Grid: Live Feed & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Live Compliance Feed (1 col) */}
          <div className="lg:col-span-1">
            <ComplianceFeed doseLogs={doseLogs} />
          </div>

          {/* Right Column: Smart Inventory Overview (2 cols) */}
          <div className="lg:col-span-2">
            <InventoryOverview
              medications={filteredMeds}
              patients={patients}
              onEditMedication={handleOpenEdit}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <RefillPlannerModal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        medications={medications}
        patients={patients}
      />

      <AddEditMedicationModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        medicationToEdit={medicationToEdit}
        patients={patients}
      />
    </div>
  );
}
