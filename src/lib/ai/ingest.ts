import type { SupabaseClient } from "@supabase/supabase-js";
import type { VoiceClassification } from "@/lib/types/database";

export async function ingestClassification(
  supabase: SupabaseClient,
  userId: string,
  transcript: string,
  classification: VoiceClassification,
  telegramMessageId?: number
) {
  let targetTable = "";
  let targetId: string | null = null;

  switch (classification.type) {
    case "task": {
      const { data } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: classification.title,
          description: classification.description,
          priority: classification.priority,
          source: "telegram",
        })
        .select("id")
        .single();
      targetTable = "tasks";
      targetId = data?.id ?? null;
      break;
    }
    case "crm": {
      const { data } = await supabase
        .from("crm_interactions")
        .insert({
          user_id: userId,
          summary: classification.summary,
          category: classification.category,
          priority: classification.priority,
          source: "voice",
          raw_transcript: transcript,
        })
        .select("id")
        .single();
      targetTable = "crm_interactions";
      targetId = data?.id ?? null;
      break;
    }
    case "journal": {
      const { data } = await supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          title: classification.title,
          body: classification.body,
          mood: classification.mood,
          source: "voice",
        })
        .select("id")
        .single();
      targetTable = "journal_entries";
      targetId = data?.id ?? null;
      break;
    }
    case "nutrition": {
      const { data } = await supabase
        .from("nutrition_entries")
        .insert({
          user_id: userId,
          description: classification.description,
          meal_type: classification.meal_type,
          calories: classification.calories,
        })
        .select("id")
        .single();
      targetTable = "nutrition_entries";
      targetId = data?.id ?? null;
      break;
    }
    case "habit_note": {
      const { data } = await supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          title: "Habit note",
          body: classification.note,
          tags: ["habit"],
          source: "voice",
        })
        .select("id")
        .single();
      targetTable = "journal_entries";
      targetId = data?.id ?? null;
      break;
    }
  }

  await supabase.from("voice_ingestions").insert({
    user_id: userId,
    telegram_message_id: telegramMessageId,
    transcript,
    classification,
    target_table: targetTable,
    target_id: targetId,
  });

  return { targetTable, targetId, classification };
}
