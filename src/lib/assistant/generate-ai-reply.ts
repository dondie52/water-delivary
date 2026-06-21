import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { PriceItem } from "@/modules/catalog/pricing";
import { buildAssistantSystemPrompt } from "@/lib/assistant/system-prompt";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const MAX_HISTORY = 12;
const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

export async function generateAiReply(
  message: string,
  history: ChatTurn[],
  catalog?: PriceItem[]
): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) {
    return "Type a question and I'll help with prices, pickup, delivery, or ordering.";
  }

  const recentHistory = history
    .filter((turn) => turn.content.trim())
    .slice(-MAX_HISTORY)
    .map((turn) => ({
      role: turn.role,
      content: turn.content.trim()
    }));

  const { text } = await generateText({
    model: google(MODEL),
    system: buildAssistantSystemPrompt(catalog),
    messages: [...recentHistory, { role: "user" as const, content: trimmed }],
    temperature: 0.4,
    maxOutputTokens: 500
  });

  return text.trim() || "Sorry, I couldn't generate a reply. Try again or WhatsApp us at +267 75 909 515.";
}
