import type {
  CalendarEvent,
  CrmContact,
  CrmInteraction,
  FinanceSnapshot,
  Habit,
  HabitSubtask,
  JournalEntry,
  NutritionEntry,
  Task,
} from "@/lib/types/database";

/** Demo data until Supabase is connected */
export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review Q2 budget",
    priority: "high",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Follow up with Alex re: partnership",
    priority: "medium",
    status: "in_progress",
    created_at: new Date().toISOString(),
  },
];

export const mockHabits: (Habit & { subtasks: HabitSubtask[] })[] = [
  {
    id: "h1",
    name: "Morning routine",
    sort_order: 0,
    subtasks: [
      { id: "s1", habit_id: "h1", title: "Meditate 10 min", sort_order: 0, completed_today: true },
      { id: "s2", habit_id: "h1", title: "Stretch", sort_order: 1, completed_today: false },
      { id: "s3", habit_id: "h1", title: "Plan top 3 tasks", sort_order: 2, completed_today: false },
    ],
  },
];

export const mockContacts: CrmContact[] = [
  { id: "c1", name: "Alex Chen", company: "Acme", tags: ["partner"] },
  { id: "c2", name: "Jordan Lee", company: "Startup XYZ", tags: ["investor"] },
];

export const mockInteractions: CrmInteraction[] = [
  {
    id: "i1",
    summary: "Discussed pilot timeline — send deck by Friday",
    category: "follow_up",
    priority: "high",
    created_at: new Date().toISOString(),
  },
];

export const mockNutrition: NutritionEntry[] = [
  {
    id: "n1",
    logged_at: new Date().toISOString(),
    meal_type: "breakfast",
    description: "Oatmeal + banana",
    calories: 380,
  },
];

export const mockJournal: JournalEntry[] = [
  {
    id: "j1",
    title: "Morning reflection",
    body: "Focused energy today. Prioritize deep work before meetings.",
    mood: "good",
    created_at: new Date().toISOString(),
  },
];

export const mockFinance: FinanceSnapshot[] = [
  {
    id: "f1",
    snapshot_date: new Date().toISOString().slice(0, 10),
    net_worth: 142500,
    cash_balance: 18500,
    investments: 124000,
    debt: 0,
    monthly_income: 9200,
    monthly_expenses: 4100,
  },
];

export const mockCalendar: CalendarEvent[] = [
  {
    id: "e1",
    title: "Team standup",
    start: new Date(Date.now() + 3600000).toISOString(),
    end: new Date(Date.now() + 5400000).toISOString(),
  },
];
