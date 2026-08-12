import { NextResponse } from 'next/server';
import { authorizeCronRequest } from '@/lib/notifications/cron-auth';
import {
  getMissingConfig,
  getNotificationConfigStatus,
} from '@/lib/notifications/config-status';
import { sendSms } from '@/lib/notifications/sms';
import { sendEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint — sends one test SMS (Eric) and one test email (Eric).
 * GET /api/notifications/test?secret=YOUR_CRON_SECRET
 */
export async function GET(request: Request) {
  const unauthorized = authorizeCronRequest(request);
  if (unauthorized) return unauthorized;

  const config = getNotificationConfigStatus();
  const missing = getMissingConfig();

  const sms = await sendSms(
    'eric',
    'MedTrack test SMS — if you received this, SMSMobileAPI is working.',
  );

  const email = await sendEmail(
    'eric',
    'MedTrack Test Email',
    '<p>If you received this, <strong>Resend email</strong> is working.</p>',
  );

  const ok = sms.success && email.success;

  return NextResponse.json({
    success: ok,
    config,
    missingEnvVars: missing.filter(k =>
      ['SMSMOBILEAPI_KEY', 'RESEND_API_KEY', 'NOTIFICATION_FROM_EMAIL'].includes(k),
    ),
    sms,
    email,
    hint: !config.sms
      ? 'Add SMSMOBILEAPI_KEY to Vercel env vars and redeploy.'
      : !config.email
        ? 'Add RESEND_API_KEY and NOTIFICATION_FROM_EMAIL to Vercel env vars and redeploy.'
        : !sms.success
          ? 'SMS key is set but send failed — keep SMSMobileAPI app open on your Android phone.'
          : !email.success
            ? 'Resend failed — with onboarding@resend.dev you can only email YOUR Resend account email until domain is verified.'
            : 'Both channels working.',
    timestamp: new Date().toISOString(),
  });
}
