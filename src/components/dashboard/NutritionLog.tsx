"use client";

import { Apple } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DashboardCard } from "./DashboardCard";
import type { NutritionEntry } from "@/lib/types/database";

export function NutritionLog({ entries }: { entries: NutritionEntry[] }) {
  const today = entries.filter((e) => {
    const d = parseISO(e.logged_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const totalCal = today.reduce((s, e) => s + (e.calories ?? 0), 0);

  return (
    <DashboardCard title="Nutrition" icon={<Apple className="h-4 w-4 text-lime-400" />}>
      <p className="mb-3 text-2xl font-bold text-lime-400/90">
        {totalCal > 0 ? `${totalCal} kcal today` : "—"}
      </p>
      {today.length === 0 ? (
        <p className="text-sm text-zinc-500">Log meals here or via voice note.</p>
      ) : (
        <ul className="space-y-2">
          {today.map((e) => (
            <li key={e.id} className="flex justify-between text-sm">
              <span className="text-zinc-300">{e.description}</span>
              <span className="text-zinc-500">{e.calories ?? "—"}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
