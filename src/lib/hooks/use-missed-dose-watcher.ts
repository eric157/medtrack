'use client';

import { useEffect, useState } from 'react';
import { getKioskPin } from '@/components/auth/KioskPinGate';
import { processMissedDosesAction } from '@/lib/actions/missed-dose-actions';

/** Re-render kiosk UI as time windows change (every minute). */
export function useClockTick(intervalMs = 60_000) {
  useEffect(() => {
    const id = setInterval(() => {
      window.dispatchEvent(new Event('medtrack-clock-tick'));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

/** Record missed doses while kiosk is open. */
export function useMissedDoseWatcher() {
  useClockTick(60_000);

  useEffect(() => {
    const run = () => {
      const pin = getKioskPin();
      if (pin) processMissedDosesAction(pin);
    };

    run();
    const id = setInterval(run, 2 * 60_000);
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
