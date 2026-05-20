"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { AuthNotice } from "./AuthNotice";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { JournalEntry } from "@/lib/types/database";

export function Journal() {
  const { user, loading: authLoading, supabase } = useSupabaseUser();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!user || !supabase) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("journal_entries")
      .select("id, title, body, mood, tags, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (fetchError) setError(fetchError.message);
    else setEntries((data ?? []) as JournalEntry[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading) fetchEntries();
  }, [authLoading, fetchEntries]);

  async function submitEntry() {
    if (!user || !supabase || !draft.trim()) return;

    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      body: draft.trim(),
      source: "manual",
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setDraft("");
    setExpanded(false);
    await fetchEntries();
  }

  return (
    <DashboardCard
      title="Journal"
      icon={<BookOpen className="h-4 w-4 text-indigo-400" />}
      action={
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800"
          aria-label="New journal entry"
        >
          <Plus className="h-4 w-4" />
        </button>
      }
      className="lg:col-span-2"
    >
      <AuthNotice />

      {expanded && (
        <div className="mb-4 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            disabled={!user || submitting}
            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none disabled:opacity-40"
          />
          <button
            type="button"
            disabled={!user || submitting || !draft.trim()}
            onClick={submitEntry}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            {submitting ? "Saving…" : "Save entry"}
          </button>
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      <div className="max-h-64 space-y-3 overflow-y-auto">
        {loading || authLoading ? (
          <p className="text-sm text-zinc-500">Loading journal…</p>
        ) : !user ? (
          <p className="text-sm text-zinc-500">Sign in above to read and write entries.</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No entries yet. Click + to write, or use Telegram voice notes.
          </p>
        ) : (
          entries.slice(0, 5).map((e) => (
            <article key={e.id} className="rounded-xl bg-zinc-800/30 p-3">
              {e.title && <h4 className="text-sm font-medium text-zinc-200">{e.title}</h4>}
              <p className="mt-1 line-clamp-3 text-sm text-zinc-400">{e.body}</p>
            </article>
          ))
        )}
      </div>
    </DashboardCard>
  );
}
