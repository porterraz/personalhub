"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

type SupabaseContextValue = {
  supabase: SupabaseClient | null;
  user: User | null;
  loading: boolean;
  configError: string | null;
};

const SupabaseContext = createContext<SupabaseContextValue>({
  supabase: null,
  user: null,
  loading: true,
  configError: null,
});

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const { url, key } = getSupabasePublicEnv();
    if (!url || !key) {
      setConfigError(
        "Supabase env missing. In C:\\Users\\porte\\personal-os\\.env.local add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then restart npm run dev."
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
      setConfigError(
        err instanceof Error ? err.message : "Failed to initialize Supabase"
      );
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ supabase, user, loading, configError }),
    [supabase, user, loading, configError]
  );

  return (
    <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
  );
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
