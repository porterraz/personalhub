"use client";

import { CheckCircle2, Circle, ListTodo } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import type { Task } from "@/lib/types/database";

const priorityColors: Record<string, string> = {
  urgent: "text-red-400",
  high: "text-orange-400",
  medium: "text-amber-400",
  low: "text-zinc-500",
};

export function KeyTasks({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => t.status !== "done" && t.status !== "archived");

  return (
    <DashboardCard title="Key Tasks" icon={<ListTodo className="h-4 w-4 text-violet-400" />}>
      {open.length === 0 ? (
        <p className="text-sm text-zinc-500">No open tasks. Add one or send a voice note.</p>
      ) : (
        <ul className="space-y-2">
          {open.map((t) => (
            <li key={t.id} className="flex items-start gap-2 rounded-lg px-1 py-1.5 hover:bg-zinc-800/50">
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
