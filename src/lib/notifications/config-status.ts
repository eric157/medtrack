import { isEmailConfigured } from '@/lib/notifications/email';
import { isSmsConfigured } from '@/lib/notifications/sms';

export function getNotificationConfigStatus() {
  return {
    sms: isSmsConfigured(),
    email: isEmailConfigured(),
    cronSecret: Boolean(process.env.CRON_SECRET),
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
  };
}

export function getMissingConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.SMSMOBILEAPI_KEY) missing.push('SMSMOBILEAPI_KEY');
  if (!process.env.RESEND_API_KEY) missing.push('RESEND_API_KEY');
  if (!process.env.NOTIFICATION_FROM_EMAIL) missing.push('NOTIFICATION_FROM_EMAIL');
  if (!process.env.CRON_SECRET) missing.push('CRON_SECRET');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return missing;
}
