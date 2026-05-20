"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { AuthNotice } from "./AuthNotice";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { FinanceSnapshot } from "@/lib/types/database";

function formatMoney(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function FinancePulse({ defaultVisible = false }: { defaultVisible?: boolean }) {
  const { user, loading: authLoading, supabase } = useSupabaseUser();
  const [visible, setVisible] = useState(defaultVisible);
  const [snapshots, setSnapshots] = useState<FinanceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinance = useCallback(async () => {
    if (!user || !supabase) {
      setSnapshots([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("finance_snapshots")
      .select(
        "id, snapshot_date, net_worth, cash_balance, investments, debt, monthly_income, monthly_expenses"
      )
      .order("snapshot_date", { ascending: false })
      .limit(5);

    if (fetchError) setError(fetchError.message);
    else setSnapshots((data ?? []) as FinanceSnapshot[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading) fetchFinance();
  }, [authLoading, fetchFinance]);

  const latest = snapshots[0];

  if (!visible) {
    return (
      <DashboardCard
        title="Finance Pulse"
        icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
        action={
          <button
            type="button"
            onClick={() => setVisible(true)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            aria-label="Show finance"
          >
            <Eye className="h-4 w-4" />
          </button>
        }
        className="opacity-60"
      >
        <p className="text-sm text-zinc-500">Hidden — click the eye to reveal.</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Finance Pulse"
      icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
      action={
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          aria-label="Hide finance"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      }
    >
      <AuthNotice />
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      {loading || authLoading ? (
        <p className="text-sm text-zinc-500">Loading finance…</p>
      ) : !user ? (
        <p className="text-sm text-zinc-500">Sign in to view finance snapshots.</p>
      ) : latest ? (
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Net worth" value={formatMoney(latest.net_worth)} highlight />
          <Stat label="Cash" value={formatMoney(latest.cash_balance)} />
          <Stat label="Investments" value={formatMoney(latest.investments)} />
          <Stat label="Debt" value={formatMoney(latest.debt)} />
          <Stat label="Monthly in" value={formatMoney(latest.monthly_income)} />
          <Stat label="Monthly out" value={formatMoney(latest.monthly_expenses)} />
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          No snapshots yet. Sync from Google Sheets or add rows in{" "}
          <code className="text-emerald-400/80">finance_snapshots</code>.
        </p>
      )}
    </DashboardCard>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={highlight ? "text-xl font-bold text-emerald-400" : "text-lg font-semibold"}>
        {value}
      </p>
    </div>
  );
}
