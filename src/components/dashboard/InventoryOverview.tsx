'use client';

import React from 'react';
import { Medication, Patient } from '@/lib/types';
import { calculateDepletionForecast, formatDaysRemainingText } from '@/lib/forecasting';
import { useMedTrackStore } from '@/lib/store';
import { Package, AlertTriangle, Plus, Minus, Edit3, Trash2 } from 'lucide-react';

interface InventoryOverviewProps {
  medications: Medication[];
  patients: Patient[];
  onEditMedication: (med: Medication) => void;
}

export function InventoryOverview({ medications, patients, onEditMedication }: InventoryOverviewProps) {
  const { updateMedicationStock, deleteMedication } = useMedTrackStore();

  const handleStockChange = (medId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    updateMedicationStock(medId, newStock);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Smart Inventory Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automated depletion forecasting math & stock tracking
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Tracked: <strong className="text-slate-900 dark:text-white">{medications.length} Medications</strong>
        </div>
      </div>

      {/* Medication Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map(med => {
          const patient = patients.find(p => p.id === med.patient_id);
          const patientName = patient ? patient.name : 'Unknown';
          const forecast = calculateDepletionForecast(med, patientName);

          // Stock health colors
          let progressColor = 'bg-emerald-500';
          let borderHighlight = 'border-slate-200 dark:border-slate-800';
          let badgeBg = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300';

          if (forecast.daysLeft <= 3) {
            progressColor = 'bg-rose-500';
            borderHighlight = 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/10';
            badgeBg = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300';
          } else if (forecast.isLowStock) {
            progressColor = 'bg-amber-500';
            borderHighlight = 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10';
            badgeBg = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300';
          }

          const stockPercent = Math.min(100, Math.round((med.current_stock / Math.max(1, med.pack_size)) * 100));

          return (
            <div
              key={med.id}
              className={`p-5 rounded-2xl border ${borderHighlight} transition-all space-y-4 flex flex-col justify-between`}
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      {med.name}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                      {patientName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 capitalize">
                    {med.time_of_day} Dose &bull; {med.dosage_per_take} tab(s) per take
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEditMedication(med)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors"
                    title="Edit Medication"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMedication(med.id)}
                    className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 rounded-lg transition-colors"
                    title="Delete Medication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Meter & Days Left Math */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400">
                    Remaining Stock: <strong className="text-slate-900 dark:text-white text-sm">{med.current_stock} pills</strong>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${badgeBg}`}>
                    {forecast.isLowStock && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                    {formatDaysRemainingText(forecast.daysLeft)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Est. Depletion Date: <strong>{forecast.depletionDate}</strong></span>
                  <span>Refill target (30d): +{forecast.refillQuantityNeeded} pills</span>
                </p>
              </div>

              {/* Quick Adjustment Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 font-semibold">Quick Stock Adj:</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleStockChange(med.id, med.current_stock, -1)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold transition-colors"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleStockChange(med.id, med.current_stock, 10)}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-lg font-bold transition-colors"
                  >
                    +10 Pills
                  </button>
                  <button
                    onClick={() => handleStockChange(med.id, med.current_stock, 30)}
                    className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg font-bold transition-colors"
                  >
                    +30 (Pack)
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
