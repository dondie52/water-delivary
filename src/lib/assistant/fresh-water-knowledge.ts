import type { PriceItem } from "@/modules/catalog/pricing";
import { priceBook } from "@/modules/catalog/pricing";
import { FWM_PHONE_DISPLAY } from "@/lib/contact";

const PICKUP_POINTS = [
  "Vegas Parking Lot",
  "UB Clinic Parking",
  "475 Parking Lot",
  "Block 470 Parking Lot"
];

const DELIVERY_SLOTS = ["8am–10am", "1pm–3pm", "4pm–6pm"];

export const ASSISTANT_QUICK_PROMPTS = [
  "What are your prices?",
  "Pickup locations",
  "Delivery slots & fee",
  "How do I order?",
  "Track my order"
] as const;

export const ASSISTANT_WELCOME =
  "Hi! I'm Fresh Water Market's free AI assistant. Ask about prices, pickup, delivery, refills, ice, or personalized bottles — or tap a suggestion below.";

function fmt(value: number): string {
  return `P${value % 1 === 0 ? value : value.toFixed(2)}`;
}

function catalogSource(catalog?: PriceItem[]): PriceItem[] {
  const source = catalog && catalog.length > 0 ? catalog : priceBook;
  return source.filter((item) => item.active !== false);
}

function priceLine(catalog: PriceItem[], sku: string, fallback: string): string {
  const item = catalog.find((p) => p.sku === sku);
  return item ? fmt(item.price) : fallback;
}

function buildPriceList(catalog?: PriceItem[]): string {
  const items = catalogSource(catalog);
  const refill = items.find((p) => p.category === "refill" || p.sku === "FWM-REFILL-L");
  const delivery = items.find((p) => p.sku === "FWM-DEL-STUDENT");

  return [
    `• 250ml bottle — ${priceLine(items, "FWM-BW-250", "P3")}`,
    `• 500ml bottle — ${priceLine(items, "FWM-BW-500", "P5")}`,
    `• 5L bottle — ${priceLine(items, "FWM-BW-5000", "P20")}`,
    `• Refill — ${refill ? `${fmt(refill.price)}/L` : "P1.60/L"}`,
    `• Standard case 500ml ×24 — ${priceLine(items, "FWM-CASE-500-24", "P120")}`,
    `• Personalized 500ml ×24 — ${priceLine(items, "FWM-PW-500-24", "P144")}`,
    `• Student delivery — ${delivery ? fmt(delivery.price) : "P30"}`
  ].join("\n");
}

function matches(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

export function getAssistantReply(message: string, catalog?: PriceItem[]): string {
  const text = message.trim().toLowerCase();
  if (!text) {
    return "Type a question and I'll help with prices, pickup, delivery, or ordering.";
  }

  if (matches(text, ["hello", "hi", "hey", "good morning", "good afternoon"])) {
    return `${ASSISTANT_WELCOME}\n\nReady to order? Go to /order on this site.`;
  }

  if (matches(text, ["price", "cost", "how much", "pricing", "rate", "p3", "p5", "p144"])) {
    return `Here are popular Fresh Water Market prices:\n\n${buildPriceList(catalog)}\n\nSee everything at /order or the homepage pricing section.`;
  }

  if (matches(text, ["refill", "litre", "liter", "container"])) {
    const items = catalogSource(catalog);
    const refill = items.find((p) => p.category === "refill" || p.sku === "FWM-REFILL-L");
    const perLitre = refill ? fmt(refill.price) : "P1.60";
    return `Water refills are ${perLitre} per litre. Bring your containers to any pickup point.\n\nOrder a refill: /order?service=refill`;
  }

  if (matches(text, ["pickup", "collect", "parking", "where"])) {
    return `Pickup points around campus:\n\n${PICKUP_POINTS.map((p) => `• ${p}`).join("\n")}\n\nChoose your spot when you order at /order.`;
  }

  if (matches(text, ["deliver", "delivery", "slot", "student delivery"])) {
    const items = catalogSource(catalog);
    const delivery = items.find((p) => p.sku === "FWM-DEL-STUDENT");
    const fee = delivery ? fmt(delivery.price) : "P30";
    return `Student delivery is ${fee} per trip. Available slots:\n\n${DELIVERY_SLOTS.map((s) => `• ${s}`).join("\n")}\n\nAdd your address at checkout: /order`;
  }

  if (matches(text, ["ice", "cooler", "bagged"])) {
    return "We supply bagged ice for events and coolers. Prices vary — submit an inquiry at /order?service=ice and we'll confirm before delivery.";
  }

  if (matches(text, ["personal", "brand", "event", "corporate", "sticker", "custom"])) {
    return "Personalized bottled water starts from P96–P144 per case depending on size. Sticker design is P200.\n\nOrder branded bottles: /order?service=personalized\nCorporate quotes: /corporate";
  }

  if (matches(text, ["track", "status", "where is my", "order number"])) {
    return "Track your order by phone or order number at /track — no login needed.";
  }

  if (matches(text, ["order", "buy", "place", "checkout", "shop"])) {
    return "Order in under a minute at /order — choose refill, bottled water, ice, or personalized bottles, then pickup or delivery.";
  }

  if (matches(text, ["whatsapp", "phone", "call", "contact", "human", "speak"])) {
    return `WhatsApp us at ${FWM_PHONE_DISPLAY} for help from the team.\n\nOr keep chatting here — it's free and instant.`;
  }

  if (matches(text, ["payment", "cash", "orange money", "pay"])) {
    return "We accept cash, Orange Money, and bank transfer. Choose your payment method in Advanced options at checkout.";
  }

  if (matches(text, ["thank", "thanks", "cheers"])) {
    return "You're welcome! Stay hydrated — order anytime at /order.";
  }

  return `I can help with prices, pickup points, delivery slots, refills, ice, and how to order.\n\nTry asking "What are your prices?" or go straight to /order.\n\nNeed a person? WhatsApp ${FWM_PHONE_DISPLAY}.`;
}
