import { NextRequest, NextResponse } from "next/server";
import { getAssistantReply } from "@/lib/assistant/fresh-water-knowledge";
import { loadCatalogProducts } from "@/lib/catalog/load-catalog-products";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message : "";

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const catalog = await loadCatalogProducts();
    const reply = getAssistantReply(message, catalog);

    return NextResponse.json({ data: { reply } });
  } catch {
    return NextResponse.json({ error: "Could not process your message." }, { status: 500 });
  }
}
