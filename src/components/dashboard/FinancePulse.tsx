"use client";

import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { useState } from "react";
import { DashboardCard } from "./DashboardCard";
import type { FinanceSnapshot } from "@/lib/types/database";

interface FinancePulseProps {
  snapshots: FinanceSnapshot[];
  defaultVisible?: boolean;
}

function formatMoney(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function FinancePulse({ snapshots, defaultVisible = false }: FinancePulseProps) {
  const [visible, setVisible] = useState(defaultVisible);
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
      {latest ? (
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
          Connect Google Sheets in settings to sync finance data.
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
