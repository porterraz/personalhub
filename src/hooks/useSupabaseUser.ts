"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export function useSupabaseUser() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const { url, key } = getSupabasePublicEnv();
    if (!url || !key) {
      setConfigError(
        "Supabase env missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local in the personal-os folder, then restart npm run dev."
      );
      setLoading(false);
      return;
    }

    try {
      const client = createClient();
      setSupabase(client);

      client.auth.getUser().then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : "Failed to initialize Supabase");
      setLoading(false);
    }
  }, []);

  return { user, loading, supabase, configError };
}
