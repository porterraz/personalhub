"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DashboardCard } from "./DashboardCard";
import type { CalendarEvent } from "@/lib/types/database";

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    fetch("/api/calendar")
      .then((res) => res.json())
      .then((data: { events?: CalendarEvent[]; configured?: boolean }) => {
        setEvents(data.events ?? []);
        setConfigured(data.configured ?? false);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardCard title="Calendar" icon={<Calendar className="h-4 w-4 text-sky-400" />}>
      {loading ? (
        <p className="text-sm text-zinc-500">Loading calendar…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {configured
            ? "No upcoming events."
            : "Connect Google Calendar — set GOOGLE_REFRESH_TOKEN in .env.local."}
        </p>
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
