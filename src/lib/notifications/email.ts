import type { RecipientKey } from '@/lib/notifications/recipients';
import { RECIPIENTS } from '@/lib/notifications/recipients';

const RESEND_API_URL = 'https://api.resend.com/emails';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFICATION_FROM_EMAIL);
}

export async function sendEmail(
  recipientKey: RecipientKey,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;

  if (!apiKey || !from) {
    return { success: false, error: 'RESEND_API_KEY or NOTIFICATION_FROM_EMAIL not configured' };
  }

  const recipient = RECIPIENTS[recipientKey];
  if (!recipient?.email) {
    return { success: false, error: `No email for ${recipientKey}` };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient.email],
        subject,
        html,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = typeof data.message === 'string' ? data.message : JSON.stringify(data);
      return { success: false, error: `Resend ${res.status}: ${msg}` };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Email send failed',
    };
  }
}
