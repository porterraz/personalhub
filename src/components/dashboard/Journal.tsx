"use client";

import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import type { JournalEntry } from "@/lib/types/database";

export function Journal({
  entries,
  onCreate,
}: {
  entries: JournalEntry[];
  onCreate?: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);

  return (
    <DashboardCard
      title="Journal"
      icon={<BookOpen className="h-4 w-4 text-indigo-400" />}
      action={
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
        </button>
      }
      className="lg:col-span-2"
    >
      {expanded && (
        <div className="mb-4 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => {
              onCreate?.(draft.trim());
              setDraft("");
              setExpanded(false);
            }}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            Save entry
          </button>
        </div>
      )}
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="text-sm text-zinc-500">Start journaling or use Telegram voice notes.</p>
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
