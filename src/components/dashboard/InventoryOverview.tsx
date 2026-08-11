'use client';

import React from 'react';
import { Medication, Patient } from '@/lib/types';
import { calculateDepletionForecast, formatDaysRemainingText } from '@/lib/forecasting';
import {
  groupMedicationsForInventory,
  getSharedStock,
  formatMedicationSchedule,
} from '@/lib/group-medications';
import { useUpdateStock, useDeleteMedication } from '@/lib/queries/use-medtrack';
import { Package, AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PACK_INCREMENTS = [5, 10, 15, 30] as const;

interface InventoryOverviewProps {
  medications: Medication[];
  patients: Patient[];
  onEditMedication: (med: Medication) => void;
}

export function InventoryOverview({ medications, patients, onEditMedication }: InventoryOverviewProps) {
  const updateStock = useUpdateStock();
  const deleteMed = useDeleteMedication();
  const inventoryGroups = groupMedicationsForInventory(medications);

  const handleStockChange = (primaryId: string, currentStock: number, delta: number) => {
    updateStock.mutate({ id: primaryId, stock: Math.max(0, currentStock + delta) });
  };

  const handleDeleteGroup = (entries: Medication[]) => {
    for (const entry of entries) {
      deleteMed.mutate(entry.id);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-3 border-b pb-4">
        <Package className="w-6 h-6 text-indigo-500" />
        <div>
          <h2 className="text-xl font-extrabold">Smart Inventory Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            One card per medication · multi-dose schedules share the same bottle
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inventoryGroups.map(group => {
          const patient = patients.find(p => p.id === group.patient_id);
          const stock = getSharedStock(group.entries);
          const forecastMed = { ...group.primary, current_stock: stock };
          const forecast = calculateDepletionForecast(forecastMed, patient?.name ?? 'Unknown');
          const stockPercent = Math.min(100, Math.round((stock / Math.max(1, group.primary.pack_size)) * 100));
          const groupKey = `${group.patient_id}|${group.name}`;

          return (
            <div key={groupKey} className={`p-5 rounded-2xl border space-y-4 ${forecast.isLowStock ? 'border-amber-300 bg-amber-50/30' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-black text-lg">{group.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {patient?.name} · {formatMedicationSchedule(group.timeSlots)}
                  </p>
                </div>
                {forecast.isLowStock && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{stock} pills</span>
                  <span>{formatDaysRemainingText(forecast.daysLeft)}</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${forecast.isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${stockPercent}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Depletion: {forecast.depletionDate}</p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {PACK_INCREMENTS.map(amount => (
                      <Button
                        key={`minus-${amount}`}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-bold min-w-[2.5rem]"
                        disabled={updateStock.isPending}
                        onClick={() => handleStockChange(group.primary.id, stock, -amount)}
                      >
                        −{amount}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {PACK_INCREMENTS.map(amount => (
                      <Button
                        key={`plus-${amount}`}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-bold min-w-[2.5rem] text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        disabled={updateStock.isPending}
                        onClick={() => handleStockChange(group.primary.id, stock, amount)}
                      >
                        +{amount}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => onEditMedication(group.primary)}><Edit3 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.entries)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
