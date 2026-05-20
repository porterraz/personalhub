"use client";

import { useState } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

export function AuthNotice() {
  const { user, loading, supabase, configError } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (configError) {
    return (
      <section className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
        <p className="font-medium">Supabase not configured</p>
        <p className="mt-1 whitespace-pre-wrap text-red-200/90">{configError}</p>
      </section>
    );
  }

  if (loading || user || !supabase) return null;

  async function signIn() {
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMessage(error.message);
  }

  async function signUp() {
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) setMessage(error.message);
    else setMessage("Check your email to confirm, or sign in if confirmation is off.");
  }

  return (
    <section className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
      <p className="mb-2 font-medium text-amber-200">Sign in to load & save data</p>
      <div className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950/50 px-2 py-1.5 text-xs text-zinc-100"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950/50 px-2 py-1.5 text-xs text-zinc-100"
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy || !email || !password}
            onClick={signIn}
            className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-40"
          >
            Sign in
          </button>
          <button
            type="button"
            disabled={busy || !email || !password}
            onClick={signUp}
            className="rounded-lg border border-zinc-600 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40"
          >
            Sign up
          </button>
        </div>
      </div>
      {message && <p className="mt-2 text-xs text-amber-300/90">{message}</p>}
    </section>
  );
}
