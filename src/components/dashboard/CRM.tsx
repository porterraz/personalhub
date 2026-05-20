"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DashboardCard } from "./DashboardCard";
import { AuthNotice } from "./AuthNotice";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { CrmContact, CrmInteraction, TaskPriority } from "@/lib/types/database";

export function CRM() {
  const { user, loading: authLoading, supabase } = useSupabaseUser();
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [interactions, setInteractions] = useState<CrmInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [leadName, setLeadName] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [interactionSummary, setInteractionSummary] = useState("");
  const [interactionCategory, setInteractionCategory] = useState("general");

  const fetchCrm = useCallback(async () => {
    if (!user || !supabase) {
      setContacts([]);
      setInteractions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [contactsRes, interactionsRes] = await Promise.all([
      supabase
        .from("crm_contacts")
        .select("id, name, email, company, tags, last_contacted_at")
        .order("name")
        .limit(50),
      supabase
        .from("crm_interactions")
        .select("id, summary, category, priority, contact_id, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (contactsRes.error) setError(contactsRes.error.message);
    else setContacts((contactsRes.data ?? []) as CrmContact[]);

    if (interactionsRes.error) setError(interactionsRes.error.message);
    else setInteractions((interactionsRes.data ?? []) as CrmInteraction[]);

    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading) fetchCrm();
  }, [authLoading, fetchCrm]);

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !supabase || !leadName.trim()) return;

    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("crm_contacts").insert({
      user_id: user.id,
      name: leadName.trim(),
      company: leadCompany.trim() || null,
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setLeadName("");
    setLeadCompany("");
    await fetchCrm();
  }

  async function logInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !supabase || !interactionSummary.trim()) return;

    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("crm_interactions").insert({
      user_id: user.id,
      summary: interactionSummary.trim(),
      category: interactionCategory,
      priority: "medium" as TaskPriority,
      source: "manual",
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setInteractionSummary("");
    await fetchCrm();
  }

  return (
    <DashboardCard title="CRM" icon={<Users className="h-4 w-4 text-pink-400" />}>
      <AuthNotice />

      <form onSubmit={addLead} className="mb-3 flex flex-col gap-2">
        <input
          type="text"
          value={leadName}
          onChange={(e) => setLeadName(e.target.value)}
          placeholder="Lead name"
          disabled={!user || submitting}
          className="rounded-xl border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-pink-500 focus:outline-none disabled:opacity-40"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={leadCompany}
            onChange={(e) => setLeadCompany(e.target.value)}
            placeholder="Company (optional)"
            disabled={!user || submitting}
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950/50 px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!user || submitting || !leadName.trim()}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Add lead
          </button>
        </div>
      </form>

      <form onSubmit={logInteraction} className="mb-4 flex flex-col gap-2 border-t border-zinc-800/80 pt-3">
        <input
          type="text"
          value={interactionSummary}
          onChange={(e) => setInteractionSummary(e.target.value)}
          placeholder="Log interaction…"
          disabled={!user || submitting}
          className="rounded-xl border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-pink-500 focus:outline-none disabled:opacity-40"
        />
        <div className="flex gap-2">
          <select
            value={interactionCategory}
            onChange={(e) => setInteractionCategory(e.target.value)}
            disabled={!user || submitting}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950/50 px-2 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
          >
            <option value="general">General</option>
            <option value="follow_up">Follow up</option>
            <option value="meeting">Meeting</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
          </select>
          <button
            type="submit"
            disabled={!user || submitting || !interactionSummary.trim()}
            className="rounded-lg border border-pink-500/50 px-3 py-1.5 text-xs font-medium text-pink-300 disabled:opacity-40"
          >
            Log item
          </button>
        </div>
      </form>

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      {loading || authLoading ? (
        <p className="text-sm text-zinc-500">Loading CRM…</p>
      ) : !user ? (
        <p className="text-sm text-zinc-500">Sign in above to manage contacts.</p>
      ) : (
        <section className="space-y-4">
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
            {contacts.length === 0 ? (
              <p className="text-sm text-zinc-500">No leads yet. Add one above.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {contacts.slice(0, 12).map((c) => (
                  <li
                    key={c.id}
                    className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                    title={c.company ?? undefined}
                  >
                    {c.name}
                    {c.company ? ` · ${c.company}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </DashboardCard>
  );
}
