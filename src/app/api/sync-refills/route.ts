import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { buildRefillItems, createGoogleTask, getValidGoogleAccessToken } from '@/lib/google-tasks';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetDaysSupply = 30, refillItems: clientItems = [] } = body;

    let accessToken: string | null = process.env.GOOGLE_ACCESS_TOKEN ?? null;
    let userId: string | undefined;

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        accessToken = await getValidGoogleAccessToken(user.id);
      }
    }

    const items = clientItems.length > 0 ? clientItems : [];

    if (!accessToken) {
      return NextResponse.json({
        success: true,
        mode: 'simulation',
        message: 'Connect Google account or set GOOGLE_ACCESS_TOKEN for live sync.',
        tasksCreated: items.map((item: { medicationName: string; patientName: string; refillQuantityNeeded: number; currentStock: number; daysLeft: number; depletionDate: string }) => ({
          title: `Refill ${item.medicationName} for ${item.patientName}`,
          notes: `${item.refillQuantityNeeded} pills needed. ${item.daysLeft} days left.`,
          dueDate: item.depletionDate,
        })),
      });
    }

    const results = [];
    for (const item of items) {
      const result = await createGoogleTask(
        accessToken,
        `💊 Refill: ${item.medicationName} (${item.patientName})`,
        `Need ${item.refillQuantityNeeded} pills for ${targetDaysSupply}-day supply. Depletion: ${item.depletionDate}.`,
        item.depletionDate
      );
      if (result) results.push(result);
    }

    return NextResponse.json({
      success: true,
      mode: 'live',
      syncedCount: results.length,
      userId,
      tasks: results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
