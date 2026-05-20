import Anthropic from "@anthropic-ai/sdk";
import type { VoiceClassification } from "@/lib/types/database";

function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

const SYSTEM = `You classify voice note transcripts for a personal OS dashboard.
Return ONLY valid JSON matching one of these shapes (no markdown):
- task: {"type":"task","title":"...","priority":"low|medium|high|urgent","description":"..."}
- crm: {"type":"crm","summary":"...","contact_name":"...","category":"follow_up|meeting|call|email|general","priority":"..."}
- journal: {"type":"journal","body":"...","mood":"great|good|neutral|low|bad","title":"..."}
- nutrition: {"type":"nutrition","description":"...","meal_type":"breakfast|lunch|dinner|snack","calories":number}
- habit_note: {"type":"habit_note","note":"..."}

Pick the single best category. Infer priority from urgency language.`;

export async function classifyTranscript(transcript: string): Promise<VoiceClassification> {
  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: SYSTEM,
    messages: [{ role: "user", content: transcript }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(text) as VoiceClassification;
  return parsed;
}
