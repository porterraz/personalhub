"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, Check } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { AuthNotice } from "./AuthNotice";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { Habit, HabitSubtask } from "@/lib/types/database";

type HabitWithSubtasks = Habit & { subtasks: HabitSubtask[] };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyHabits() {
  const { user, loading: authLoading, supabase } = useSupabaseUser();
  const [habits, setHabits] = useState<HabitWithSubtasks[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!user || !supabase) {
      setHabits([]);
      setCompletedIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const today = todayISO();

    const [habitsRes, completionsRes] = await Promise.all([
      supabase
        .from("habits")
        .select("id, name, sort_order, habit_subtasks(id, habit_id, title, sort_order)")
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("habit_completions")
        .select("subtask_id")
        .eq("completed_on", today),
    ]);

    if (habitsRes.error) {
      setError(habitsRes.error.message);
      setLoading(false);
      return;
    }

    const done = new Set(
      (completionsRes.data ?? [])
        .map((c) => c.subtask_id)
        .filter((id): id is string => Boolean(id))
    );
    setCompletedIds(done);

    const mapped: HabitWithSubtasks[] = (habitsRes.data ?? []).map((h) => {
      const subtasks = ((h.habit_subtasks as HabitSubtask[]) ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((st) => ({
          ...st,
          completed_today: done.has(st.id),
        }));
      return {
        id: h.id,
        name: h.name,
        sort_order: h.sort_order,
        subtasks,
      };
    });

    setHabits(mapped);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading) fetchHabits();
  }, [authLoading, fetchHabits]);

  async function toggleSubtask(habitId: string, subtaskId: string, done: boolean) {
    if (!user || !supabase) return;

    setError(null);
    const today = todayISO();

    if (done) {
      const { error: insertError } = await supabase.from("habit_completions").insert({
        user_id: user.id,
        habit_id: habitId,
        subtask_id: subtaskId,
        completed_on: today,
      });
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setCompletedIds((prev) => new Set(prev).add(subtaskId));
    } else {
      const { error: deleteError } = await supabase
        .from("habit_completions")
        .delete()
        .eq("user_id", user.id)
        .eq("subtask_id", subtaskId)
        .eq("completed_on", today);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(subtaskId);
        return next;
      });
    }

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              subtasks: h.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed_today: done } : st
              ),
            }
          : h
      )
    );
  }

  return (
    <DashboardCard title="Daily Habits" icon={<Flame className="h-4 w-4 text-orange-400" />}>
      <AuthNotice />
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      {loading || authLoading ? (
        <p className="text-sm text-zinc-500">Loading habits…</p>
      ) : !user ? (
        <p className="text-sm text-zinc-500">Sign in above to track habits.</p>
      ) : habits.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No habits yet. Add rows in Supabase{" "}
          <code className="text-orange-400/80">habits</code> and{" "}
          <code className="text-orange-400/80">habit_subtasks</code>.
        </p>
      ) : (
        <div className="space-y-4">
          {habits.map((h) => (
            <div key={h.id}>
              <p className="mb-2 text-sm font-semibold text-zinc-200">{h.name}</p>
              <ul className="space-y-1.5 pl-1">
                {h.subtasks.map((st) => {
                  const done = completedIds.has(st.id);
                  return (
                    <li key={st.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                        <button
                          type="button"
                          onClick={() => toggleSubtask(h.id, st.id, !done)}
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            done
                              ? "border-orange-500 bg-orange-500/20 text-orange-400"
                              : "border-zinc-600 hover:border-zinc-500"
                          }`}
                        >
                          {done && <Check className="h-3 w-3" />}
                        </button>
                        <span className={done ? "text-zinc-500 line-through" : ""}>{st.title}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
