"use client";

import { useCallback, useEffect, useState } from "react";
import { Apple, Plus } from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import { DashboardCard } from "./DashboardCard";
import { AuthNotice } from "./AuthNotice";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { NutritionEntry } from "@/lib/types/database";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export function NutritionLog() {
  const { user, loading: authLoading, supabase } = useSupabaseUser();
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [calories, setCalories] = useState("");

  const fetchEntries = useCallback(async () => {
    if (!user || !supabase) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("nutrition_entries")
      .select("id, logged_at, meal_type, description, calories")
      .order("logged_at", { ascending: false })
      .limit(50);

    if (fetchError) setError(fetchError.message);
    else setEntries((data ?? []) as NutritionEntry[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading) fetchEntries();
  }, [authLoading, fetchEntries]);

  async function logMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !supabase || !description.trim()) return;

    setSubmitting(true);
    setError(null);
    const cal = calories.trim() ? parseInt(calories, 10) : null;

    const { error: insertError } = await supabase.from("nutrition_entries").insert({
      user_id: user.id,
      description: description.trim(),
      meal_type: mealType,
      calories: cal && !Number.isNaN(cal) ? cal : null,
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setDescription("");
    setCalories("");
    await fetchEntries();
  }

  const today = entries.filter((e) => isToday(parseISO(e.logged_at)));
  const totalCal = today.reduce((s, e) => s + (e.calories ?? 0), 0);

  return (
    <DashboardCard title="Nutrition" icon={<Apple className="h-4 w-4 text-lime-400" />}>
      <AuthNotice />

      <form onSubmit={logMeal} className="mb-4 flex flex-col gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you eat?"
          disabled={!user || submitting}
          className="rounded-xl border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none disabled:opacity-40"
        />
        <div className="flex gap-2">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            disabled={!user || submitting}
            className="rounded-lg border border-zinc-700 bg-zinc-950/50 px-2 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="kcal"
            min={0}
            disabled={!user || submitting}
            className="w-20 rounded-lg border border-zinc-700 bg-zinc-950/50 px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!user || submitting || !description.trim()}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-lime-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Log meal
          </button>
        </div>
      </form>

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      {loading || authLoading ? (
        <p className="text-sm text-zinc-500">Loading nutrition…</p>
      ) : !user ? (
        <p className="text-sm text-zinc-500">Sign in above to log meals.</p>
      ) : (
        <>
          <p className="mb-3 text-2xl font-bold text-lime-400/90">
            {totalCal > 0 ? `${totalCal} kcal today` : "—"}
          </p>
          {today.length === 0 ? (
            <p className="text-sm text-zinc-500">No meals logged today.</p>
          ) : (
            <ul className="space-y-2">
              {today.map((e) => (
                <li key={e.id} className="flex justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate text-zinc-300">
                    {e.meal_type ? (
                      <span className="mr-1.5 text-xs capitalize text-zinc-500">{e.meal_type}</span>
                    ) : null}
                    {e.description}
                  </span>
                  <span className="shrink-0 text-zinc-500">{e.calories ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </DashboardCard>
  );
}
