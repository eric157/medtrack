import type { SupabaseClient } from '@supabase/supabase-js';
import { sendSms, isSmsConfigured } from '@/lib/notifications/sms';
import { sendEmail, isEmailConfigured } from '@/lib/notifications/email';
import {
  logNotificationSent,
  wasNotificationSent,
} from '@/lib/notifications/notification-log';
import type { RecipientKey } from '@/lib/notifications/recipients';
import {
  CAREGIVER_RECIPIENTS,
  RECIPIENTS,
} from '@/lib/notifications/recipients';

export interface NotifyResult {
  sms: { sent: number; skipped: number; failed: number };
  email: { sent: number; skipped: number; failed: number };
  errors: string[];
}

async function notifyRecipient(
  admin: SupabaseClient | null,
  recipientKey: RecipientKey,
  eventType: string,
  eventKey: string,
  smsMessage?: string,
  emailSubject?: string,
  emailHtml?: string,
): Promise<{ sms: 'sent' | 'skipped' | 'failed'; email: 'sent' | 'skipped' | 'failed'; errors: string[] }> {
  const errors: string[] = [];
  let sms: 'sent' | 'skipped' | 'failed' = 'skipped';
  let email: 'sent' | 'skipped' | 'failed' = 'skipped';

  const recipient = RECIPIENTS[recipientKey];

  if (smsMessage && recipient.phone) {
    if (!isSmsConfigured()) {
      sms = 'failed';
      errors.push('SMSMOBILEAPI_KEY not set in environment variables');
    } else if (admin && await wasNotificationSent(admin, eventKey, recipientKey, 'sms')) {
      sms = 'skipped';
      errors.push(`SMS ${recipientKey}: already sent for ${eventKey} (dedupe)`);
    } else {
      const result = await sendSms(recipientKey, smsMessage);
      if (result.success) {
        sms = 'sent';
        if (admin) await logNotificationSent(admin, eventKey, recipientKey, 'sms', eventType);
      } else {
        sms = 'failed';
        if (result.error) errors.push(`SMS ${recipientKey}: ${result.error}`);
      }
    }
  }

  if (emailSubject && emailHtml && recipient.email) {
    if (!isEmailConfigured()) {
      email = 'failed';
      errors.push('RESEND_API_KEY or NOTIFICATION_FROM_EMAIL not set in environment variables');
    } else if (admin && await wasNotificationSent(admin, eventKey, recipientKey, 'email')) {
      email = 'skipped';
      errors.push(`Email ${recipientKey}: already sent for ${eventKey} (dedupe)`);
    } else {
      const result = await sendEmail(recipientKey, emailSubject, emailHtml);
      if (result.success) {
        email = 'sent';
        if (admin) await logNotificationSent(admin, eventKey, recipientKey, 'email', eventType);
      } else {
        email = 'failed';
        if (result.error) errors.push(`Email ${recipientKey}: ${result.error}`);
      }
    }
  }

  return { sms, email, errors };
}

export async function notifyCaregivers(
  admin: SupabaseClient | null,
  eventType: string,
  eventKey: string,
  smsMessage: string,
  emailSubject?: string,
  emailHtml?: string,
): Promise<NotifyResult> {
  const result: NotifyResult = {
    sms: { sent: 0, skipped: 0, failed: 0 },
    email: { sent: 0, skipped: 0, failed: 0 },
    errors: [],
  };

  for (const caregiver of CAREGIVER_RECIPIENTS) {
    const r = await notifyRecipient(
      admin,
      caregiver.key,
      eventType,
      eventKey,
      smsMessage,
      caregiver.key === 'eric' ? emailSubject : undefined,
      caregiver.key === 'eric' ? emailHtml : undefined,
    );

    if (r.sms === 'sent') result.sms.sent++;
    else if (r.sms === 'failed') result.sms.failed++;
    else result.sms.skipped++;

    if (r.email === 'sent') result.email.sent++;
    else if (r.email === 'failed') result.email.failed++;
    else result.email.skipped++;

    result.errors.push(...r.errors);
  }

  return result;
}

export async function notifyPatient(
  admin: SupabaseClient | null,
  recipientKey: RecipientKey,
  eventType: string,
  eventKey: string,
  smsMessage: string,
): Promise<NotifyResult> {
  const result: NotifyResult = {
    sms: { sent: 0, skipped: 0, failed: 0 },
    email: { sent: 0, skipped: 0, failed: 0 },
    errors: [],
  };

  const r = await notifyRecipient(admin, recipientKey, eventType, eventKey, smsMessage);

  if (r.sms === 'sent') result.sms.sent++;
  else if (r.sms === 'failed') result.sms.failed++;
  else result.sms.skipped++;

  result.errors.push(...r.errors);
  return result;
}
