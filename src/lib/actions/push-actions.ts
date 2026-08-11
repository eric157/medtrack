'use server';

import webpush from 'web-push';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/server';

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:caregiver@medtrack.app';

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function savePushSubscriptionAction(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth_key: subscription.keys.auth,
  }, { onConflict: 'endpoint' });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function sendPushToAllCaregivers(
  title: string,
  body: string,
  url = '/dashboard'
): Promise<number> {
  if (!configureWebPush() || !isSupabaseConfigured()) return 0;

  const admin = createAdminClient();
  const { data: subs } = await admin.from('push_subscriptions').select('*');
  if (!subs?.length) return 0;

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth_key },
        },
        JSON.stringify({ title, body, url })
      );
      sent++;
    } catch {
      await admin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    }
  }
  return sent;
}

export async function getVapidPublicKey(): Promise<string | null> {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}
