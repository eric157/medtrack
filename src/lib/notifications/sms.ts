import type { RecipientKey } from '@/lib/notifications/recipients';
import { RECIPIENTS } from '@/lib/notifications/recipients';

const SMS_API_URL = 'https://api.smsmobileapi.com/sendsms/';

export function isSmsConfigured(): boolean {
  return Boolean(process.env.SMSMOBILEAPI_KEY);
}

export async function sendSms(
  recipientKey: RecipientKey,
  message: string,
): Promise<{ success: boolean; error?: string; response?: string }> {
  const apiKey = process.env.SMSMOBILEAPI_KEY;
  if (!apiKey) {
    return { success: false, error: 'SMSMOBILEAPI_KEY not configured' };
  }

  const recipient = RECIPIENTS[recipientKey];
  if (!recipient?.phone) {
    return { success: false, error: `No phone for ${recipientKey}` };
  }

  try {
    const body = new URLSearchParams({
      apikey: apiKey,
      recipients: recipient.phone,
      message,
      sendsms: '1',
    });

    const res = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

  const text = await res.text();

    // SMSMobileAPI may return HTTP 200 with an error in the body
    const lower = text.toLowerCase();
    if (
      !res.ok
      || lower.includes('error')
      || lower.includes('invalid')
      || lower.includes('failed')
      || lower.includes('not connected')
    ) {
      return { success: false, error: `SMS API response: ${text.slice(0, 300)}` };
    }

    return { success: true, response: text.slice(0, 200) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'SMS send failed',
    };
  }
}
