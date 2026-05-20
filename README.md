# Personal Hub

Personal operating system dashboard — tasks, habits, CRM, nutrition, journal, finance (hidden by default), Google Calendar sync, and Telegram voice capture into Supabase.

**Repo:** [github.com/porterraz/personalhub](https://github.com/porterraz/personalhub)

## Quick start

```bash
git clone https://github.com/porterraz/personalhub.git
cd personalhub
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data model, voice pipeline |
| [BUILD_GUIDE.md](./BUILD_GUIDE.md) | Phased implementation checklist (Phases 0–6) |

## Stack

- **Frontend:** Next.js 16, React, Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + RLS)
- **Integrations:** Google Calendar API, Google Sheets API, Telegram Bot API
- **AI:** OpenAI Whisper (transcription), Anthropic Claude (classification)
- **Deploy:** Vercel (serverless API routes, 60s webhook timeout)

## Dashboard modules

| Module | Description |
|--------|-------------|
| Finance Pulse | Net worth / cash / debt from Google Sheets — **hidden by default** |
| Calendar | Upcoming events from Google Calendar |
| Key Tasks | Priority tasks |
| Daily Habits | Habits with subtask checkboxes |
| CRM | Contacts + interaction log |
| Nutrition | Daily meal / calorie log |
| Journal | Entries + quick compose |

## Voice automation (Telegram)

1. User sends voice note to Telegram bot
2. Webhook `POST /api/telegram/webhook` downloads audio
3. OpenAI Whisper → transcript
4. Claude → JSON classification (`task`, `crm`, `journal`, `nutrition`, `habit_note`)
5. Insert into Supabase + audit row in `voice_ingestions`
6. Bot replies with confirmation

## Environment variables

See [.env.example](./.env.example). Never commit `.env.local`.

## Project status

| Area | Status |
|------|--------|
| Dashboard UI + live Supabase data | Done |
| Supabase Auth (inline sign-in) | Done |
| Tasks, Journal, Habits, CRM, Nutrition | Done |
| Finance snapshots (read from Supabase) | Done |
| Calendar widget (Google API) | Stub — needs GOOGLE_REFRESH_TOKEN |
| Telegram webhook route | Done (needs deploy + env) |
| Google Sheets finance sync | Not started |
| Vercel deployment | Not started |

## License

Private — personal use.
