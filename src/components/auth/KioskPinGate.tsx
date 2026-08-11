'use client';

import { useState } from 'react';
import { verifyKioskPinAction } from '@/lib/actions/medtrack-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Loader2 } from 'lucide-react';

const KIOSK_SESSION_KEY = 'medtrack_kiosk_unlocked';

export function isKioskUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(KIOSK_SESSION_KEY) === 'true';
}

export function KioskPinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(KIOSK_SESSION_KEY) === 'true'
  );
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const valid = await verifyKioskPinAction(pin);
    setLoading(false);

    if (valid) {
      sessionStorage.setItem(KIOSK_SESSION_KEY, 'true');
      sessionStorage.setItem('medtrack_kiosk_pin', pin);
      setUnlocked(true);
    } else {
      setError('Incorrect PIN. Ask your caregiver for the kiosk PIN.');
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Lock className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <CardTitle className="text-2xl">Parent Kiosk</CardTitle>
          <CardDescription>Enter the family PIN to access the medication schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="Enter PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="text-center text-2xl tracking-widest h-14"
              autoFocus
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full h-14 text-lg" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unlock Kiosk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function getKioskPin(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('medtrack_kiosk_pin');
}
