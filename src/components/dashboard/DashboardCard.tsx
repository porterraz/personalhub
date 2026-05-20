import { clsx } from "clsx";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function DashboardCard({
  title,
  icon,
  action,
  className,
  children,
}: DashboardCardProps) {
  return (
    <section
      className={clsx(
        "flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur",
        className
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          {icon}
          <span>{title}</span>
        </div>
        {action}
      </header>
      <div className="flex-1 overflow-auto">{children}</div>
    </section>
  );
}
