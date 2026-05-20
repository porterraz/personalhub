"use client";

import { Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DashboardCard } from "./DashboardCard";
import type { CrmContact, CrmInteraction } from "@/lib/types/database";

export function CRM({
  contacts,
  interactions,
}: {
  contacts: CrmContact[];
  interactions: CrmInteraction[];
}) {
  return (
    <DashboardCard title="CRM" icon={<Users className="h-4 w-4 text-pink-400" />}>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-zinc-500">Recent interactions</p>
          {interactions.length === 0 ? (
            <p className="text-sm text-zinc-500">No interactions yet.</p>
          ) : (
            <ul className="space-y-2">
              {interactions.slice(0, 5).map((i) => (
                <li key={i.id} className="rounded-lg bg-zinc-800/40 px-3 py-2">
                  <p className="text-sm">{i.summary}</p>
                  <p className="text-xs text-zinc-500">
                    {i.category} · {format(parseISO(i.created_at), "MMM d")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-zinc-500">
            Contacts ({contacts.length})
          </p>
          <ul className="flex flex-wrap gap-2">
            {contacts.slice(0, 8).map((c) => (
              <li
                key={c.id}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
              >
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardCard>
  );
}
