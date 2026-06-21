import { NextRequest, NextResponse } from "next/server";
import type { ChatTurn } from "@/lib/assistant/generate-ai-reply";
import { generateAiReply } from "@/lib/assistant/generate-ai-reply";
import { getAssistantReply } from "@/lib/assistant/fresh-water-knowledge";
import { isGeminiConfigured } from "@/lib/assistant/system-prompt";
import { loadCatalogProducts } from "@/lib/catalog/load-catalog-products";

function parseHistory(body: unknown): ChatTurn[] {
  if (!body || typeof body !== "object" || !("history" in body)) return [];
  const history = (body as { history?: unknown }).history;
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (item): item is ChatTurn =>
        Boolean(item) &&
        typeof item === "object" &&
        "role" in item &&
        "content" in item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .map((item) => ({ role: item.role, content: item.content }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message : "";
    const history = parseHistory(body);

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const catalog = await loadCatalogProducts();

    if (isGeminiConfigured()) {
      try {
        const reply = await generateAiReply(message, history, catalog);
        return NextResponse.json({ data: { reply, source: "gemini" } });
      } catch {
        const reply = getAssistantReply(message, catalog);
        return NextResponse.json({ data: { reply, source: "rules" } });
      }
    }

    const reply = getAssistantReply(message, catalog);
    return NextResponse.json({ data: { reply, source: "rules" } });
  } catch {
    return NextResponse.json({ error: "Could not process your message." }, { status: 500 });
  }
}
