'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { medtrackKeys } from './keys';
import {
  fetchPatientsClient,
  fetchMedicationsClient,
  fetchDoseLogsClient,
} from '@/lib/queries/fetch-client';
import {
  logDoseAction,
  updateMedicationStockAction,
  upsertMedicationAction,
  deleteMedicationAction,
} from '@/lib/actions/medtrack-actions';
import type { Medication } from '@/lib/types';

export function usePatients() {
  return useQuery({
    queryKey: medtrackKeys.patients(),
    queryFn: fetchPatientsClient,
    staleTime: 30_000,
    retry: 2,
  });
}

export function useMedications() {
  return useQuery({
    queryKey: medtrackKeys.medications(),
    queryFn: fetchMedicationsClient,
    staleTime: 30_000,
    retry: 2,
  });
}

export function useDoseLogs() {
  return useQuery({
    queryKey: medtrackKeys.doseLogs(),
    queryFn: () => fetchDoseLogsClient(200),
    staleTime: 10_000,
    retry: 2,
  });
}

/** Subscribe to Supabase Realtime and invalidate React Query cache */
export function useMedTrackRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    const channel = supabase
      .channel('medtrack-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medications' }, () => {
        queryClient.invalidateQueries({ queryKey: medtrackKeys.medications() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dose_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: medtrackKeys.doseLogs() });
        queryClient.invalidateQueries({ queryKey: medtrackKeys.medications() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        queryClient.invalidateQueries({ queryKey: medtrackKeys.patients() });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useLogDose() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ medicationId, status, kioskPin }: {
      medicationId: string;
      status: 'taken' | 'skipped';
      kioskPin?: string;
    }) => logDoseAction(medicationId, status, kioskPin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medtrackKeys.all });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      updateMedicationStockAction(id, stock),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: medtrackKeys.medications() }),
  });
}

export function useUpsertMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (med: Omit<Medication, 'id' | 'updated_at'> & { id?: string }) =>
      upsertMedicationAction(med),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: medtrackKeys.all }),
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMedicationAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: medtrackKeys.all }),
  });
}
