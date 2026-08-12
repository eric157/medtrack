import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecipientKey } from '@/lib/notifications/recipients';

export type NotificationChannel = 'sms' | 'email';

/** Skip if this exact notification was already sent (dedupe cron retries). */
export async function wasNotificationSent(
  admin: SupabaseClient,
  eventKey: string,
  recipientKey: RecipientKey,
  channel: NotificationChannel,
): Promise<boolean> {
  try {
    const { data, error } = await admin
      .from('notification_log')
      .select('id')
      .eq('event_key', eventKey)
      .eq('recipient_key', recipientKey)
      .eq('channel', channel)
      .maybeSingle();

    if (error) {
      // Table missing or RLS — allow send rather than block
      console.warn('notification_log read failed:', error.message);
      return false;
    }

    return Boolean(data);
  } catch {
    return false;
  }
}

export async function logNotificationSent(
  admin: SupabaseClient,
  eventKey: string,
  recipientKey: RecipientKey,
  channel: NotificationChannel,
  eventType: string,
): Promise<void> {
  try {
    const { error } = await admin.from('notification_log').upsert(
      {
        event_key: eventKey,
        recipient_key: recipientKey,
        channel,
        event_type: eventType,
        sent_at: new Date().toISOString(),
      },
      { onConflict: 'event_key,recipient_key,channel' },
    );
    if (error) console.warn('notification_log write failed:', error.message);
  } catch (err) {
    console.warn('notification_log write error:', err);
  }
}
