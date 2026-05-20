/**
 * Public Supabase env for browser + server.
 * Supports publishable key (current) or legacy anon key naming.
 */
export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  return { url, key };
}

export function requireSupabasePublicEnv() {
  const { url, key } = getSupabasePublicEnv();
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. In personal-os/.env.local set:\n" +
        "  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n" +
        "  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ... (publishable/anon key — NOT service role)\n" +
        "Restart: npm run dev"
    );
  }
  return { url, key };
}
