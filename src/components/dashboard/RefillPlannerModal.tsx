'use client';

import React, { useState } from 'react';
import { Medication, Patient } from '@/lib/types';
import { calculateDepletionForecast } from '@/lib/forecasting';
import { groupMedicationsForInventory, getSharedStock } from '@/lib/group-medications';
import { KEEP_PURCHASE_LIST } from '@/lib/seed-data';
import { ShoppingCart, Copy, ListOrdered } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RefillPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  patients: Patient[];
}

export function RefillPlannerModal({ isOpen, onClose, medications, patients }: RefillPlannerModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'keepList' | 'calculated30d'>('keepList');

  const refillList = groupMedicationsForInventory(medications.filter(m => m.is_active))
    .map(group => {
      const patientName = patients.find(p => p.id === group.patient_id)?.name ?? 'Unknown';
      const stock = getSharedStock(group.entries);
      return calculateDepletionForecast({ ...group.primary, current_stock: stock }, patientName, 30);
    })
    .filter(item => item.refillQuantityNeeded > 0);

  const handleGoogleTasksSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing to Google Tasks...');
    try {
      const res = await fetch('/api/sync-refills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDaysSupply: 30, refillItems: refillList }),
      });
      const data = await res.json();
      setSyncStatus(data.mode === 'live'
        ? `Synced ${data.syncedCount ?? refillList.length} tasks to Google Tasks`
        : `Simulated ${refillList.length} tasks (connect Google account for live sync)`);
    } catch {
      setSyncStatus('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyKeepList = () => {
    const text = [`Refill Purchase List — ${new Date().toLocaleDateString()}`, '---',
      ...KEEP_PURCHASE_LIST.map(i => `• ${i.medicationName} — ${i.packs} pack(s)`),
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-500" />
            Refill & Purchase Planner
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Update stock per medication on the inventory cards below — use +/− or Edit to set the exact count.
        </p>

        <div className="flex gap-2">
          <Button variant={activeTab === 'keepList' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('keepList')}>
            <ListOrdered className="w-4 h-4 mr-1" /> Keep List
          </Button>
          <Button variant={activeTab === 'calculated30d' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('calculated30d')}>
            30-Day Forecast
          </Button>
        </div>

        {activeTab === 'keepList' ? (
          <ul className="space-y-2 text-sm">
            {KEEP_PURCHASE_LIST.map(item => (
              <li key={item.medicationName} className="flex justify-between p-3 rounded-lg bg-muted">
                <span className="font-semibold">{item.medicationName}</span>
                <span>{item.packs} pack(s)</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2 text-sm max-h-60 overflow-y-auto">
            {refillList.map(item => (
              <li key={item.medicationId} className="flex justify-between p-3 rounded-lg border">
                <span>{item.medicationName} ({item.patientName})</span>
                <span className="font-bold text-amber-600">+{item.refillQuantityNeeded} pills</span>
              </li>
            ))}
            {refillList.length === 0 && <p className="text-muted-foreground text-center py-4">All stocks at 30-day target</p>}
          </ul>
        )}

        {syncStatus && (
          <p className={`text-sm font-semibold ${syncStatus.includes('Failed') ? 'text-rose-600' : 'text-emerald-600'}`}>
            {syncStatus}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleCopyKeepList}>
            <Copy className="w-4 h-4 mr-1" />{copied ? 'Copied!' : 'Copy List'}
          </Button>
          <Button onClick={handleGoogleTasksSync} disabled={isSyncing} className="bg-amber-500 hover:bg-amber-600 text-slate-950">
            {isSyncing ? 'Syncing...' : 'Sync to Google Tasks'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
