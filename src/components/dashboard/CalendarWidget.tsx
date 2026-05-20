"use client";

import { Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DashboardCard } from "./DashboardCard";
import type { CalendarEvent } from "@/lib/types/database";

export function CalendarWidget({ events }: { events: CalendarEvent[] }) {
  return (
    <DashboardCard title="Calendar" icon={<Calendar className="h-4 w-4 text-sky-400" />}>
      {events.length === 0 ? (
        <p className="text-sm text-zinc-500">No upcoming events. Connect Google Calendar.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="border-l-2 border-sky-500/50 pl-3">
              <p className="font-medium text-zinc-100">{e.title}</p>
              <p className="text-xs text-zinc-500">
                {e.start ? format(parseISO(e.start), "EEE MMM d · h:mm a") : "—"}
              </p>
              {e.location && <p className="text-xs text-zinc-600">{e.location}</p>}
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
