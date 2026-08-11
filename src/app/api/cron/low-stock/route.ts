import { NextResponse } from 'next/server';
import { syncLowStockToGoogleTasks } from '@/lib/google-tasks';
import { sendPushToAllCaregivers } from '@/lib/actions/push-actions';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { calculateDepletionForecast } from '@/lib/forecasting';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const admin = createAdminClient();
  const { data: caregivers } = await admin.from('user_integrations').select('user_id').limit(1);
  const userId = caregivers?.[0]?.user_id;

  const result = await syncLowStockToGoogleTasks(userId);

  const { data: medications } = await admin.from('medications').select('*').eq('is_active', true);
  const { data: patients } = await admin.from('patients').select('*');

  const lowStock = (medications ?? [])
    .map(m => {
      const p = patients?.find(pt => pt.id === m.patient_id);
      return calculateDepletionForecast(m, p?.name ?? '', 30);
    })
    .filter(f => f.isLowStock);

  if (lowStock.length > 0) {
    const names = lowStock.map(l => l.medicationName).join(', ');
    await sendPushToAllCaregivers(
      '⚠️ Low Medication Stock',
      `${lowStock.length} medication(s) running low: ${names}`,
      '/dashboard'
    );
  }

  return NextResponse.json({
    success: true,
    ...result,
    lowStockCount: lowStock.length,
    timestamp: new Date().toISOString(),
  });
}
