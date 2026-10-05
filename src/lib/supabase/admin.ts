import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client for privileged, server-only operations that must bypass
// RLS: creating student accounts from a scanned paper, writing their contact
// details, enrolling them in a classroom. NEVER import this into client code.
// Returns null when the service-role key is not configured so callers can
// degrade gracefully instead of throwing.
export function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
