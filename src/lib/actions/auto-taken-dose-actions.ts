'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { processAutoTakenDoses } from '@/lib/auto-taken-doses';

function validateKioskPin(pin: string): boolean {
  return pin === (process.env.KIOSK_PIN || '1234');
}

export async function processAutoTakenDosesAction(
  kioskPin?: string,
): Promise<{ success: boolean; recorded: number; names: string[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, recorded: 0, names: [], error: 'Supabase not configured' };
  }

  if (kioskPin && !validateKioskPin(kioskPin)) {
    return { success: false, recorded: 0, names: [], error: 'Invalid kiosk PIN' };
  }

  if (!kioskPin) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, recorded: 0, names: [], error: 'Not authenticated' };
    }
  }

  const admin = createAdminClient();
  const result = await processAutoTakenDoses(admin);

  if (result.recorded > 0) {
    revalidatePath('/kiosk');
    revalidatePath('/dashboard');
  }

  return { success: true, ...result };
}
