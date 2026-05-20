export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "open" | "in_progress" | "done" | "archived";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_at?: string | null;
  source?: string;
  created_at: string;
}

export interface Habit {
  id: string;
  name: string;
  sort_order: number;
  subtasks?: HabitSubtask[];
}

export interface HabitSubtask {
  id: string;
  habit_id: string;
  title: string;
  sort_order: number;
  completed_today?: boolean;
}

export interface CrmContact {
  id: string;
  name: string;
  email?: string | null;
  company?: string | null;
  tags?: string[];
  last_contacted_at?: string | null;
}

export interface CrmInteraction {
  id: string;
  summary: string;
  category: string;
  priority: TaskPriority;
  contact_id?: string | null;
  created_at: string;
}

export interface NutritionEntry {
  id: string;
  logged_at: string;
  meal_type?: string | null;
  description: string;
  calories?: number | null;
}

export interface JournalEntry {
  id: string;
  title?: string | null;
  body: string;
  mood?: string | null;
  tags?: string[];
  created_at: string;
}

export interface FinanceSnapshot {
  id: string;
  snapshot_date: string;
  net_worth?: number | null;
  cash_balance?: number | null;
  investments?: number | null;
  debt?: number | null;
  monthly_income?: number | null;
  monthly_expenses?: number | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}

export type VoiceClassification =
  | { type: "task"; title: string; priority: TaskPriority; description?: string }
  | { type: "crm"; summary: string; contact_name?: string; category: string; priority: TaskPriority }
  | { type: "journal"; body: string; mood?: string; title?: string }
  | { type: "nutrition"; description: string; meal_type?: string; calories?: number }
  | { type: "habit_note"; note: string };
