"use client";

import { useSupabase } from "@/providers/SupabaseProvider";

/** @deprecated Use useSupabase from SupabaseProvider */
export function useSupabaseUser() {
  const { supabase, user, loading, configError } = useSupabase();
  return { supabase, user, loading, configError };
}
