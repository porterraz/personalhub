const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

export async function downloadVoiceFile(fileId: string): Promise<Buffer> {
  const fileRes = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
  const fileJson = await fileRes.json();
  const filePath = fileJson.result?.file_path;
  if (!filePath) throw new Error("Could not resolve Telegram file path");

  const audioRes = await fetch(
    `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`
  );
  return Buffer.from(await audioRes.arrayBuffer());
}

export interface TelegramUpdate {
  message?: {
    message_id: number;
    chat: { id: number };
    voice?: { file_id: string };
    text?: string;
  };
}
