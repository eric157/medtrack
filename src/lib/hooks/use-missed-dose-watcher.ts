'use client';

import { useEffect, useState } from 'react';
import { getKioskPin } from '@/components/auth/KioskPinGate';
import { processAutoTakenDosesAction } from '@/lib/actions/auto-taken-dose-actions';

/** Re-render kiosk UI as time windows change (every minute). */
export function useClockTick(intervalMs = 60_000) {
  useEffect(() => {
    const id = setInterval(() => {
      window.dispatchEvent(new Event('medtrack-clock-tick'));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

/** Auto-mark past-due doses as taken while kiosk is open (every 2 min). */
export function useAutoTakenWatcher() {
  useClockTick(60_000);

  useEffect(() => {
    const run = () => {
      const pin = getKioskPin();
      if (pin) processAutoTakenDosesAction(pin);
    };

    run();
    const id = setInterval(run, 2 * 60_000);
    return () => clearInterval(id);
  }, []);
}

/** Auto-mark past-due doses as taken while caregiver dashboard is open (every 5 min). */
export function useCaregiverAutoTakenWatcher() {
  useClockTick(60_000);

  useEffect(() => {
    const run = () => processAutoTakenDosesAction();
    run();
    const id = setInterval(run, 5 * 60_000);
    return () => clearInterval(id);
  }, []);
}

/** Subscribe to clock ticks for live time-block UI updates. */
export function useMedtrackClock(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener('medtrack-clock-tick', handler);
    return () => window.removeEventListener('medtrack-clock-tick', handler);
  }, []);

  return tick;
}
