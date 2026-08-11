'use client';

import React from 'react';
import { Medication, Patient } from '@/lib/types';
import { calculateDepletionForecast, formatDaysRemainingText } from '@/lib/forecasting';
import { useUpdateStock, useDeleteMedication } from '@/lib/queries/use-medtrack';
import { Package, AlertTriangle, Plus, Minus, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryOverviewProps {
  medications: Medication[];
  patients: Patient[];
  onEditMedication: (med: Medication) => void;
}

export function InventoryOverview({ medications, patients, onEditMedication }: InventoryOverviewProps) {
  const updateStock = useUpdateStock();
  const deleteMed = useDeleteMedication();

  const handleStockChange = (medId: string, currentStock: number, delta: number) => {
    updateStock.mutate({ id: medId, stock: Math.max(0, currentStock + delta) });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-3 border-b pb-4">
        <Package className="w-6 h-6 text-indigo-500" />
        <div>
          <h2 className="text-xl font-extrabold">Smart Inventory Dashboard</h2>
          <p className="text-xs text-muted-foreground">Live from Supabase · auto-updates on dose logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map(med => {
          const patient = patients.find(p => p.id === med.patient_id);
          const forecast = calculateDepletionForecast(med, patient?.name ?? 'Unknown');
          const stockPercent = Math.min(100, Math.round((med.current_stock / Math.max(1, med.pack_size)) * 100));

          return (
            <div key={med.id} className={`p-5 rounded-2xl border space-y-4 ${forecast.isLowStock ? 'border-amber-300 bg-amber-50/30' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-black text-lg">{med.name}</span>
                  <p className="text-xs text-muted-foreground">{patient?.name} · {med.time_of_day}</p>
                </div>
                {forecast.isLowStock && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{med.current_stock} pills</span>
                  <span>{formatDaysRemainingText(forecast.daysLeft)}</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${forecast.isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${stockPercent}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Depletion: {forecast.depletionDate}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="icon" onClick={() => handleStockChange(med.id, med.current_stock, -1)}><Minus className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => handleStockChange(med.id, med.current_stock, 1)}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onEditMedication(med)}><Edit3 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMed.mutate(med.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
