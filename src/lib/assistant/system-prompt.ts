import type { PriceItem } from "@/modules/catalog/pricing";
import { priceBook } from "@/modules/catalog/pricing";
import { FWM_PHONE_DISPLAY } from "@/lib/contact";

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

function buildLivePrices(catalog?: PriceItem[]): string {
  const items = catalogSource(catalog);
  const refill = items.find((p) => p.category === "refill" || p.sku === "FWM-REFILL-L");
  const delivery = items.find((p) => p.sku === "FWM-DEL-STUDENT");

  return [
    `250ml bottled water = ${priceLine(items, "FWM-BW-250", "P3")}`,
    `330ml bottled water = ${priceLine(items, "FWM-BW-330", "P4")}`,
    `500ml bottled water = ${priceLine(items, "FWM-BW-500", "P5")}`,
    `1.5L bottled water = ${priceLine(items, "FWM-BW-1500", "P10")}`,
    `5L bottled water = ${priceLine(items, "FWM-BW-5000", "P20")}`,
    `Refill = ${refill ? `${fmt(refill.price)} per litre` : "P1.60 per litre"}`,
    `Student delivery = ${delivery ? fmt(delivery.price) : "P30"}`,
    `Standard case 250ml x24 = ${priceLine(items, "FWM-CASE-250-24", "P72")}`,
    `Standard case 330ml x24 = ${priceLine(items, "FWM-CASE-330-24", "P96")}`,
    `Standard case 500ml x24 = ${priceLine(items, "FWM-CASE-500-24", "P120")}`,
    `Personalized 250ml x24 = ${priceLine(items, "FWM-PW-250-24", "P96")}`,
    `Personalized 330ml x24 = ${priceLine(items, "FWM-PW-330-24", "P120")}`,
    `Personalized 500ml x24 = ${priceLine(items, "FWM-PW-500-24", "P144")}`,
    `Sticker design = P200`
  ].join("\n");
}

export function buildAssistantSystemPrompt(catalog?: PriceItem[]): string {
  return `You are Fresh Water Market's helpful customer assistant. Help customers order bottled water, refills, ice, and personalized bottles. Keep answers short, friendly, and action-focused. Use Fresh Water Market prices, pickup points, delivery slots, and WhatsApp number. Do not perform admin actions.

## Current prices (use these exact amounts)
${buildLivePrices(catalog)}

## Pickup points
- Vegas Parking Lot
- UB Clinic Parking
- 475 Parking Lot
- Block 470 Parking Lot

## Delivery slots
- 8am–10am
- 1pm–3pm
- 4pm–6pm

## Contact
${FWM_PHONE_DISPLAY} (WhatsApp)

## What you can help with
- Prices and product options
- Pickup points and delivery slots
- Refill pricing
- Placing orders (direct to /order)
- Tracking orders (direct to /track)
- Personalized bottles and corporate/event orders (direct to /corporate or /order?service=personalized)

## Rules
- Never claim to change orders, access admin systems, or process payments.
- When suggesting pages, use site paths like /order, /track, /corporate (no domain).
- Suggest /order, /track, /corporate, or WhatsApp when the customer is ready to act.
- Keep replies concise — 2–4 sentences unless listing prices.
- Answer in the same language the customer uses when possible.`;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
}
