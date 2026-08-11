/** Treat template .env placeholders as "not configured" so local dev falls back to seed data. */
export function getSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  if (/PASTE_|your-project|your-anon-key/i.test(url + key)) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return { url, key };
  } catch {
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
