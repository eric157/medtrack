import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { calculateDepletionForecast } from '@/lib/forecasting';
import type { Medication, Patient } from '@/lib/types';

export async function getValidGoogleAccessToken(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return process.env.GOOGLE_ACCESS_TOKEN ?? null;

  const admin = createAdminClient();
  const { data: integration } = await admin
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (!integration) return process.env.GOOGLE_ACCESS_TOKEN ?? null;

  const expiresAt = new Date(integration.expires_at);
  if (expiresAt.getTime() > Date.now() + 60_000) {
    return integration.access_token;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: integration.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) return null;

  const tokens = await res.json();
  const newExpires = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await admin.from('user_integrations').update({
    access_token: tokens.access_token,
    expires_at: newExpires,
  }).eq('id', integration.id);

  return tokens.access_token;
}

export async function createGoogleTask(
  accessToken: string,
  title: string,
  notes: string,
  dueDate: string
): Promise<{ id: string } | null> {
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      notes,
      due: `${dueDate}T09:00:00.000Z`,
    }),
  });

  if (!res.ok) return null;
  return res.json();
}

export function buildRefillItems(medications: Medication[], patients: Patient[], targetDays = 30) {
  return medications
    .filter(m => m.is_active)
    .map(med => {
      const patient = patients.find(p => p.id === med.patient_id);
      return calculateDepletionForecast(med, patient?.name ?? 'Unknown', targetDays);
    })
    .filter(item => item.isLowStock || item.refillQuantityNeeded > 0);
}

export async function syncLowStockToGoogleTasks(userId?: string): Promise<{
  synced: number;
  mode: 'live' | 'simulation';
  tasks: Array<{ title: string; dueDate: string }>;
}> {
  if (!isSupabaseConfigured()) {
    return { synced: 0, mode: 'simulation', tasks: [] };
  }

  const admin = createAdminClient();
  const [{ data: medications }, { data: patients }] = await Promise.all([
    admin.from('medications').select('*').eq('is_active', true),
    admin.from('patients').select('*'),
  ]);

  const refillItems = buildRefillItems(medications ?? [], patients ?? [], 30);
  const lowStockItems = refillItems.filter(i => i.isLowStock);

  let accessToken: string | null = null;
  if (userId) {
    accessToken = await getValidGoogleAccessToken(userId);
  }
  if (!accessToken) accessToken = process.env.GOOGLE_ACCESS_TOKEN ?? null;

  const tasks: Array<{ title: string; dueDate: string }> = [];
  let synced = 0;

  for (const item of lowStockItems) {
    const med = medications?.find(m => m.id === item.medicationId);
    if (!med) continue;

    const { data: existing } = await admin
      .from('google_task_sync_log')
      .select('id')
      .eq('medication_id', med.id)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .maybeSingle();

    if (existing) continue;

    const title = `💊 Refill: ${item.medicationName} (${item.patientName})`;
    const notes = `MedTrack Auto-Alert: ${item.daysLeft} days left. Need ${item.refillQuantityNeeded} pills for 30-day supply.`;

    tasks.push({ title, dueDate: item.depletionDate });

    if (accessToken) {
      const result = await createGoogleTask(accessToken, title, notes, item.depletionDate);
      if (result) {
        await admin.from('google_task_sync_log').insert({
          medication_id: med.id,
          google_task_id: result.id,
          task_title: title,
        });
        synced++;
      }
    }
  }

  return { synced, mode: accessToken ? 'live' : 'simulation', tasks };
}
