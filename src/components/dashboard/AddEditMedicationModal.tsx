'use client';

import React, { useState, useEffect } from 'react';
import { Medication, Patient, TimeOfDay } from '@/lib/types';
import { useUpsertMedication } from '@/lib/queries/use-medtrack';
import { PlusCircle, Edit3, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddEditMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationToEdit?: Medication | null;
  patients: Patient[];
}

export function AddEditMedicationModal({ isOpen, onClose, medicationToEdit, patients }: AddEditMedicationModalProps) {
  const upsert = useUpsertMedication();
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [name, setName] = useState('');
  const [dosagePerTake, setDosagePerTake] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [currentStock, setCurrentStock] = useState(30);
  const [packSize, setPackSize] = useState(30);
  const [dailyFrequency, setDailyFrequency] = useState(1);
  const [lowStockThresholdDays, setLowStockThresholdDays] = useState(5);

  useEffect(() => {
    if (medicationToEdit) {
      setPatientId(medicationToEdit.patient_id);
      setName(medicationToEdit.name);
      setDosagePerTake(medicationToEdit.dosage_per_take);
      setTimeOfDay(medicationToEdit.time_of_day);
      setCurrentStock(medicationToEdit.current_stock);
      setPackSize(medicationToEdit.pack_size);
      setDailyFrequency(medicationToEdit.daily_frequency);
      setLowStockThresholdDays(medicationToEdit.low_stock_threshold_days);
    } else {
      setPatientId(patients[0]?.id || '');
      setName('');
      setDosagePerTake(1);
      setTimeOfDay('morning');
      setCurrentStock(30);
      setPackSize(30);
      setDailyFrequency(1);
      setLowStockThresholdDays(5);
    }
  }, [medicationToEdit, patients, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await upsert.mutateAsync({
      ...(medicationToEdit?.id ? { id: medicationToEdit.id } : {}),
      patient_id: patientId,
      name: name.trim(),
      dosage_per_take: Number(dosagePerTake),
      time_of_day: timeOfDay,
      current_stock: Number(currentStock),
      pack_size: Number(packSize),
      daily_frequency: Number(dailyFrequency),
      low_stock_threshold_days: Number(lowStockThresholdDays),
      is_active: true,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {medicationToEdit ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            {medicationToEdit ? 'Edit Medication' : 'Add Medication'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full h-10 rounded-md border px-3">
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Input required placeholder="Medication name" value={name} onChange={e => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select value={timeOfDay} onChange={e => setTimeOfDay(e.target.value as TimeOfDay)} className="h-10 rounded-md border px-3">
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
            <Input type="number" min={1} value={dosagePerTake} onChange={e => setDosagePerTake(Number(e.target.value))} placeholder="Dosage" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" min={0} value={currentStock} onChange={e => setCurrentStock(Number(e.target.value))} placeholder="Stock" />
            <Input type="number" min={1} value={packSize} onChange={e => setPackSize(Number(e.target.value))} placeholder="Pack size" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" min={1} value={dailyFrequency} onChange={e => setDailyFrequency(Number(e.target.value))} placeholder="Daily freq" />
            <Input type="number" min={1} value={lowStockThresholdDays} onChange={e => setLowStockThresholdDays(Number(e.target.value))} placeholder="Alert days" />
          </div>
          <Button type="submit" className="w-full" disabled={upsert.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {medicationToEdit ? 'Save Changes' : 'Create Medication'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
