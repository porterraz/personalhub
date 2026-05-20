"use client";

import { FinancePulse } from "@/components/dashboard/FinancePulse";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { KeyTasks } from "@/components/dashboard/KeyTasks";
import { DailyHabits } from "@/components/dashboard/DailyHabits";
import { CRM } from "@/components/dashboard/CRM";
import { NutritionLog } from "@/components/dashboard/NutritionLog";
import { Journal } from "@/components/dashboard/Journal";
import { SupabaseProvider, useSupabase } from "@/providers/SupabaseProvider";

function EnvBanner() {
  const { configError, loading } = useSupabase();
  if (!configError) return null;
  return (
    <section className="mb-4 rounded-xl border border-red-500/50 bg-red-950/40 p-4 text-sm text-red-100">
      <p className="font-semibold">Setup required</p>
      <p className="mt-1 text-red-200/90">{configError}</p>
      <p className="mt-2 text-xs text-red-300/80">
        Dashboard layout will still load below. Fix .env.local and restart the dev server.
      </p>
      {loading ? <p className="mt-1 text-xs">Checking auth…</p> : null}
    </section>
  );
}

function DashboardWidgets() {
  return (
    <>
      <EnvBanner />
      <FinancePulse />
      <CalendarWidget />
      <KeyTasks />
      <DailyHabits />
      <CRM />
      <NutritionLog />
      <Journal />
    </>
  );
}

export function DashboardGrid() {
  return (
    <SupabaseProvider>
      <DashboardWidgets />
    </SupabaseProvider>
  );
}
