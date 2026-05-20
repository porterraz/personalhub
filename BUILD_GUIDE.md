# Personal OS — Step-by-step build guide

Work through these phases in order. Each phase has a **done when** checkpoint.

---

## Phase 0 — Run the scaffold (today)

```bash
cd C:\Users\porte\personal-os
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 — you should see the dashboard with mock data.

**Done when:** Dashboard renders all six sections; Finance Pulse is hidden until you click the eye.

---

## Phase 1 — Supabase foundation

### 1.1 Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → New project.
2. Copy **Project URL** and **publishable** (anon) key into `.env.local`.
3. Copy **service role** key into `.env.local` (server only).

### 1.2 Apply schema

Option A — SQL Editor: paste `supabase/migrations/20260519000000_initial_schema.sql` and run.

Option B — CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

### 1.3 Enable Auth

1. Supabase → Authentication → Providers → enable Email (or Google).
2. Add redirect URL: `http://localhost:3000/auth/callback`.

### 1.4 Wire dashboard to live data

Replace mock imports in `src/app/page.tsx` with server-side Supabase queries (see Phase 2 snippet in README).

**Done when:** You can sign up, sign in, and see empty real tables (or seed data you insert).

---

## Phase 2 — Connect dashboard to Supabase

Create `src/lib/data/fetch-dashboard.ts`:

```ts
import { createClient } from "@/lib/supabase/server";

export async function fetchDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [tasks, habits, journal, nutrition, crmContacts, crmInteractions, finance] =
    await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("habits").select("*, habit_subtasks(*)").eq("active", true),
      supabase.from("journal_entries").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("nutrition_entries").select("*").order("logged_at", { ascending: false }).limit(20),
      supabase.from("crm_contacts").select("*").limit(20),
      supabase.from("crm_interactions").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("finance_snapshots").select("*").order("snapshot_date", { ascending: false }).limit(1),
    ]);

  return { tasks, habits, journal, nutrition, crmContacts, crmInteractions, finance };
}
```

Make `page.tsx` an async server component that calls this and passes props to widgets.

Add client mutations for habit checkboxes and journal create (Supabase client + `router.refresh()`).

**Done when:** Creating a row in Supabase Table Editor appears on the dashboard after refresh.

---

## Phase 3 — Google Calendar

### 3.1 Google Cloud setup

1. [Google Cloud Console](https://console.cloud.google.com) → New project.
2. Enable **Google Calendar API** and **Google Sheets API**.
3. OAuth consent screen → External → add your email as test user.
4. Credentials → OAuth 2.0 Client → Web application.
5. Redirect URI: `http://localhost:3000/api/auth/google/callback` (add production URL later).

### 3.2 Get refresh token

Implement `src/app/api/auth/google/callback/route.ts` to exchange `code` for tokens and log `refresh_token` once (store in `.env.local` as `GOOGLE_REFRESH_TOKEN`).

Or use [Google OAuth Playground](https://developers.google.com/oauthplayground) with Calendar + Sheets scopes.

### 3.3 Live calendar widget

`GET /api/calendar` already calls `fetchUpcomingEvents`. From the dashboard, `fetch('/api/calendar')` on load and pass events to `CalendarWidget`.

**Done when:** Your next Google Calendar event shows in the widget.

---

## Phase 4 — Google Sheets finance sync

### 4.1 Sheet layout

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| date | net_worth | cash | investments | debt | monthly_income | monthly_expenses |

### 4.2 Configure

Set `GOOGLE_SHEETS_FINANCE_ID` (from the sheet URL) in `.env.local`.

### 4.3 Sync

```bash
curl -X POST http://localhost:3000/api/finance/sync \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

Or add a “Sync finance” button that POSTs while logged in.

**Done when:** Finance Pulse shows real numbers after sync (and you reveal it with the eye icon).

---

## Phase 5 — Telegram voice pipeline

### 5.1 Create bot

1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → save token → `TELEGRAM_BOT_TOKEN`.
2. Generate random `TELEGRAM_WEBHOOK_SECRET` (32+ chars).

### 5.2 Link your account

1. Message your bot → note chat ID from `/start` reply (or use `getUpdates`).
2. In Supabase `profiles`, set `telegram_chat_id` for your user row.

### 5.3 Deploy & register webhook

```bash
vercel deploy
```

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://YOUR_APP.vercel.app/api/telegram/webhook" \
  -d "secret_token=YOUR_TELEGRAM_WEBHOOK_SECRET"
```

Add all env vars in Vercel project settings.

### 5.4 Test

Send a voice note: *“Remind me to email Sarah about the contract by Friday — high priority.”*

**Done when:** Bot confirms classification; row appears in `tasks` or `crm_interactions`; `voice_ingestions` has a log row.

---

## Phase 6 — Polish & harden

- [ ] Supabase Auth UI (login page, middleware protect `/`)
- [ ] Cron on Vercel to `POST /api/finance/sync` nightly
- [ ] Persist habit checkbox toggles to `habit_completions`
- [ ] Settings page: link Telegram, toggle Finance Pulse default
- [ ] Error monitoring (Sentry)

---

## Environment checklist

| Variable | Required for |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_*` | Dashboard + auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Telegram webhook |
| `OPENAI_API_KEY` | Whisper |
| `GEMINI_API_KEY` | Classification |
| `TELEGRAM_*` | Voice bot |
| `GOOGLE_*` | Calendar + Sheets |

---

## Suggested build order (summary)

1. **Scaffold** → run locally with mocks  
2. **Supabase** → schema, auth, live dashboard  
3. **Google Calendar** → live events  
4. **Google Sheets** → finance sync  
5. **Telegram** → voice → Supabase  
6. **Polish** → auth gate, crons, settings  

Questions on any phase? Pick a phase number and we can implement it together in the codebase.
