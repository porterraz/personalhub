-- Personal OS: initial schema
-- Run via Supabase CLI or SQL editor after linking project

-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  telegram_chat_id bigint unique,
  finance_pulse_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Key tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'archived')),
  due_at timestamptz,
  source text default 'manual' check (source in ('manual', 'telegram', 'calendar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daily habits with subtasks
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.habit_subtasks (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  subtask_id uuid references public.habit_subtasks (id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, habit_id, subtask_id, completed_on)
);

-- CRM contacts & interactions
create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  tags text[] default '{}',
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.crm_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  summary text not null,
  category text not null default 'general' check (category in ('follow_up', 'meeting', 'call', 'email', 'general')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  source text default 'manual' check (source in ('manual', 'telegram', 'voice')),
  raw_transcript text,
  created_at timestamptz not null default now()
);

-- Nutrition log
create table public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_at timestamptz not null default now(),
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  description text not null,
  calories int,
  protein_g numeric(6, 1),
  carbs_g numeric(6, 1),
  fat_g numeric(6, 1),
  notes text,
  created_at timestamptz not null default now()
);

-- Journal
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  body text not null,
  mood text check (mood in ('great', 'good', 'neutral', 'low', 'bad')),
  tags text[] default '{}',
  source text default 'manual' check (source in ('manual', 'telegram', 'voice')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Finance snapshots (from Google Sheets sync)
create table public.finance_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  snapshot_date date not null default current_date,
  net_worth numeric(14, 2),
  cash_balance numeric(14, 2),
  investments numeric(14, 2),
  debt numeric(14, 2),
  monthly_income numeric(14, 2),
  monthly_expenses numeric(14, 2),
  raw_payload jsonb,
  synced_at timestamptz not null default now(),
  unique (user_id, snapshot_date)
);

-- Voice / Telegram ingestion log
create table public.voice_ingestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  telegram_message_id bigint,
  transcript text not null,
  classification jsonb not null,
  target_table text not null,
  target_id uuid,
  created_at timestamptz not null default now()
);

-- Indexes
create index tasks_user_status_idx on public.tasks (user_id, status);
create index habits_user_idx on public.habits (user_id);
create index journal_user_created_idx on public.journal_entries (user_id, created_at desc);
create index nutrition_user_logged_idx on public.nutrition_entries (user_id, logged_at desc);
create index crm_interactions_user_idx on public.crm_interactions (user_id, created_at desc);

-- RLS
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_subtasks enable row level security;
alter table public.habit_completions enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_interactions enable row level security;
alter table public.nutrition_entries enable row level security;
alter table public.journal_entries enable row level security;
alter table public.finance_snapshots enable row level security;
alter table public.voice_ingestions enable row level security;

-- Profiles policies
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Generic user-owned row policies
create policy "Users manage own tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own habits" on public.habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own habit subtasks" on public.habit_subtasks for all
  using (exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()))
  with check (exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()));
create policy "Users manage own habit completions" on public.habit_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own crm contacts" on public.crm_contacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own crm interactions" on public.crm_interactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own nutrition" on public.nutrition_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own journal" on public.journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own finance" on public.finance_snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own voice ingestions" on public.voice_ingestions for select using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
