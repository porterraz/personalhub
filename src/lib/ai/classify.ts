import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VoiceClassification } from "@/lib/types/database";

const SYSTEM = `You classify voice note transcripts for a personal OS dashboard.
Return ONLY valid JSON matching one of these shapes (no markdown, no code fences):
- task: {"type":"task","title":"...","priority":"low|medium|high|urgent","description":"..."}
- crm: {"type":"crm","summary":"...","contact_name":"...","category":"follow_up|meeting|call|email|general","priority":"low|medium|high|urgent"}
- journal: {"type":"journal","body":"...","mood":"great|good|neutral|low|bad","title":"..."}
- nutrition: {"type":"nutrition","description":"...","meal_type":"breakfast|lunch|dinner|snack","calories":number}
- habit_note: {"type":"habit_note","note":"..."}

Pick the single best category. Infer priority from urgency language.`;

function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

function parseClassificationJson(text: string): VoiceClassification {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const parsed = JSON.parse(raw) as VoiceClassification;
  if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
    throw new Error("Model returned JSON without a type field");
  }
  return parsed;
}

export async function classifyTranscript(transcript: string): Promise<VoiceClassification> {
  const model = getGemini().getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    systemInstruction: SYSTEM,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 512,
    },
  });

  const result = await model.generateContent(
    `Classify this voice note transcript:\n\n${transcript}`
  );

  const text = result.response.text();
  if (!text) throw new Error("Gemini returned an empty classification response");

  return parseClassificationJson(text);
}
