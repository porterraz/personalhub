"use client";

import { useState } from "react";
import { Flame, Check } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import type { Habit, HabitSubtask } from "@/lib/types/database";

interface DailyHabitsProps {
  habits: (Habit & { subtasks: HabitSubtask[] })[];
  onToggleSubtask?: (habitId: string, subtaskId: string, done: boolean) => void;
}

export function DailyHabits({ habits, onToggleSubtask }: DailyHabitsProps) {
  const [local, setLocal] = useState<Record<string, boolean>>({});

  function toggle(habitId: string, subtaskId: string, current: boolean) {
    const next = !current;
    setLocal((s) => ({ ...s, [subtaskId]: next }));
    onToggleSubtask?.(habitId, subtaskId, next);
  }

  return (
    <DashboardCard title="Daily Habits" icon={<Flame className="h-4 w-4 text-orange-400" />}>
      {habits.length === 0 ? (
        <p className="text-sm text-zinc-500">Create habits in Supabase to track routines.</p>
      ) : (
        <div className="space-y-4">
          {habits.map((h) => (
            <div key={h.id}>
              <p className="mb-2 text-sm font-semibold text-zinc-200">{h.name}</p>
              <ul className="space-y-1.5 pl-1">
                {(h.subtasks ?? []).map((st) => {
                  const done = local[st.id] ?? st.completed_today ?? false;
                  return (
                    <li key={st.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                        <button
                          type="button"
                          onClick={() => toggle(h.id, st.id, done)}
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
