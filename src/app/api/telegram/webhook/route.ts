import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { transcribeAudio } from "@/lib/ai/transcribe";
import { classifyTranscript } from "@/lib/ai/classify";
import { ingestClassification } from "@/lib/ai/ingest";
import {
  downloadVoiceFile,
  sendMessage,
  type TelegramUpdate,
} from "@/lib/telegram/bot";

export const runtime = "nodejs";
export const maxDuration = 60;

async function resolveUserId(chatId: number): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = (await req.json()) as TelegramUpdate;
  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;

  if (message.text === "/start") {
    await sendMessage(
      chatId,
      "Personal OS bot ready. Link your chat ID in the dashboard settings, then send voice notes."
    );
    return NextResponse.json({ ok: true });
  }

  if (!message.voice) {
    await sendMessage(chatId, "Send a voice note to log tasks, CRM notes, journal, or nutrition.");
    return NextResponse.json({ ok: true });
  }

  const userId = await resolveUserId(chatId);
  if (!userId) {
    await sendMessage(
      chatId,
      `Link this chat first. Your chat ID is \`${chatId}\`. Add it to your profile in Personal OS.`
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const audio = await downloadVoiceFile(message.voice.file_id);
    const transcript = await transcribeAudio(audio); // OpenAI Whisper
    const classification = await classifyTranscript(transcript); // Google Gemini
    const supabase = createAdminClient();
    const { targetTable, classification: cls } = await ingestClassification(
      supabase,
      userId,
      transcript,
      classification,
      message.message_id
    );

    await sendMessage(
      chatId,
      `Logged as *${cls.type}* → \`${targetTable}\`\n\n_"${transcript.slice(0, 120)}${transcript.length > 120 ? "…" : ""}"_`
    );
  } catch (err) {
    console.error("Telegram voice pipeline error:", err);
    await sendMessage(chatId, "Failed to process voice note. Try again in a moment.");
  }

  return NextResponse.json({ ok: true });
}
