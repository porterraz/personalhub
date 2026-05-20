# Personal OS

A personal operating system dashboard: tasks, habits, CRM, nutrition, journal, finance (hidden by default), Google Calendar, and Telegram voice capture.

## Quick start

```bash
cd personal-os
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design and data model
- [BUILD_GUIDE.md](./BUILD_GUIDE.md) — phased implementation checklist

## Stack

- **Frontend:** Next.js 16, React, Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + RLS)
- **Integrations:** Google Calendar, Google Sheets, Telegram
- **AI:** OpenAI Whisper (transcription), Claude (classification)
- **Deploy:** Vercel (serverless API routes)

## Project status

| Area | Status |
|------|--------|
| Dashboard UI | ✅ Scaffolded with mock data |
| Supabase schema | ✅ Migration file ready |
| Telegram webhook | ✅ Route implemented |
| Google Calendar/Sheets | ✅ Lib + API stubs |
| Auth & live data | 🔲 Phase 2 in BUILD_GUIDE |
