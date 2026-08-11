'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { processMissedDoses } from '@/lib/missed-doses';
import { sendPushToAllCaregivers } from '@/lib/actions/push-actions';

function validateKioskPin(pin: string): boolean {
  return pin === (process.env.KIOSK_PIN || '1234');
}

export async function processMissedDosesAction(
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
  const result = await processMissedDoses(admin);

  if (result.recorded > 0) {
    const label = result.names.length <= 3
      ? result.names.join(', ')
      : `${result.names.slice(0, 3).join(', ')} +${result.names.length - 3} more`;

    await sendPushToAllCaregivers(
      '⚠️ Missed Dose Alert',
      `${result.recorded} medication(s) not marked taken: ${label}`,
      '/dashboard',
    );

    revalidatePath('/kiosk');
    revalidatePath('/dashboard');
  }

  return { success: true, ...result };
}
