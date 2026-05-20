import OpenAI from "openai";

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

export async function transcribeAudio(buffer: Buffer, filename = "voice.ogg"): Promise<string> {
  const file = new File([new Uint8Array(buffer)], filename, { type: "audio/ogg" });
  const result = await getOpenAI().audio.transcriptions.create({
    model: "whisper-1",
    file,
    language: "en",
  });
  return result.text.trim();
}
