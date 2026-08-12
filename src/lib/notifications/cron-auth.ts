import { NextResponse } from 'next/server';

/** Validates cron requests (Bearer header or ?secret= for cron-job.org). */
export function authorizeCronRequest(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return null;

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) return null;

  const url = new URL(request.url);
  if (url.searchParams.get('secret') === cronSecret) return null;

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
