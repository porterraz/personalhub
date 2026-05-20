"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Circle, ListTodo, Plus } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { AuthNotice } from "./AuthNotice";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { Task, TaskPriority } from "@/lib/types/database";

const priorityColors: Record<string, string> = {
  urgent: "text-red-400",
  high: "text-orange-400",
  medium: "text-amber-400",
  low: "text-zinc-500",
};

export function KeyTasks() {
  const { user, loading: authLoading, supabase } = useSupabaseUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user || !supabase) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("tasks")
      .select("id, title, description, priority, status, due_at, source, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) setError(fetchError.message);
    else setTasks((data ?? []) as Task[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading) fetchTasks();
  }, [authLoading, fetchTasks]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !supabase || !title.trim()) return;

    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: title.trim(),
      priority,
      status: "open",
      source: "manual",
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    await fetchTasks();
  }

  const open = tasks.filter((t) => t.status !== "done" && t.status !== "archived");

  return (
    <DashboardCard title="Key Tasks" icon={<ListTodo className="h-4 w-4 text-violet-400" />}>
      <AuthNotice />

      <form onSubmit={addTask} className="mb-4 flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task…"
          disabled={!user || submitting}
          className="rounded-xl border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none disabled:opacity-40"
        />
        <div className="flex items-center gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            disabled={!user || submitting}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950/50 px-2 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button
            type="submit"
            disabled={!user || submitting || !title.trim()}
            className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </button>
        </div>
      </form>

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      {loading || authLoading ? (
        <p className="text-sm text-zinc-500">Loading tasks…</p>
      ) : !user ? (
        <p className="text-sm text-zinc-500">Sign in above to view and add tasks.</p>
      ) : open.length === 0 ? (
        <p className="text-sm text-zinc-500">No open tasks. Add one above or send a voice note.</p>
      ) : (
        <ul className="space-y-2">
          {open.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-2 rounded-lg px-1 py-1.5 hover:bg-zinc-800/50"
            >
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className={`text-xs capitalize ${priorityColors[t.priority]}`}>{t.priority}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {tasks.some((t) => t.status === "done") && (
        <p className="mt-3 flex items-center gap-1 text-xs text-zinc-600">
          <CheckCircle2 className="h-3 w-3" />
          {tasks.filter((t) => t.status === "done").length} completed
        </p>
      )}
    </DashboardCard>
  );
}
