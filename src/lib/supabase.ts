import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

/** @deprecated Use createClient from @/lib/supabase/client */
export const supabase = isSupabaseConfigured() ? createClient() : null;

export { createClient, isSupabaseConfigured };
