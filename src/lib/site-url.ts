import { headers } from 'next/headers';

/** Production site URL for auth redirects. Prefers env, then request host on Vercel. */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }

  return 'http://localhost:3000';
}
