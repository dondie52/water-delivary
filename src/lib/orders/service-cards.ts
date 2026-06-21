import { Droplets, Package, Snowflake, Sparkles, type LucideIcon } from "lucide-react";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { hasIceCatalogProduct, type ServiceType } from "@/lib/orders/order-wizard";
import type { PriceItem } from "@/modules/catalog/pricing";
import { priceBook } from "@/modules/catalog/pricing";

const BOTTLED_SKUS = ["FWM-BW-250", "FWM-BW-330", "FWM-BW-500", "FWM-BW-1500", "FWM-BW-5000"];
const PERSONALIZED_SKUS = ["FWM-PW-250-24", "FWM-PW-330-24", "FWM-PW-500-24"];

export type ServiceCardConfig = {
  type: ServiceType;
  title: string;
  body: string;
  icon: LucideIcon;
  image: string;
};

export const SERVICE_CARDS: ServiceCardConfig[] = [
  {
    type: "refill",
    title: "Water Refill",
    body: "Bring containers to refill.",
    icon: Droplets,
    image: BRAND_ASSETS.refill
  },
  {
    type: "bottled",
    title: "Bottled Water",
    body: "Single bottles 250ml to 5L.",
    icon: Package,
    image: BRAND_ASSETS.bottles
  },
  {
    type: "personalized",
    title: "Personalized Bottles",
    body: "Branded cases for events.",
    icon: Sparkles,
    image: BRAND_ASSETS.personalizedBottles
  },
  {
    type: "ice",
    title: "Ice",
    body: "Bagged ice for events and coolers.",
    icon: Snowflake,
    image: BRAND_ASSETS.ice
  }
];

function fmtPrice(value: number): string {
  return `P${value % 1 === 0 ? value : value.toFixed(2)}`;
}

function activeCatalog(catalog: PriceItem[]): PriceItem[] {
  const source = catalog.length > 0 ? catalog : priceBook;
  return source.filter((item) => item.active !== false);
}

export function buildServicePriceLabel(service: ServiceType, catalog: PriceItem[] = []): string {
  const items = activeCatalog(catalog);

  switch (service) {
    case "refill": {
      const refill = items.find((item) => item.category === "refill" || item.sku === "FWM-REFILL-L");
      return refill ? `From ${fmtPrice(refill.price)}/L` : "From P1.60/L";
    }
    case "bottled": {
      const bottled = items
        .filter((item) => item.category === "bottled_water" && BOTTLED_SKUS.includes(item.sku))
        .sort((a, b) => a.price - b.price);
      const cheapest = bottled[0];
      return cheapest ? `From ${fmtPrice(cheapest.price)}` : "From P5";
    }
    case "personalized": {
      const personalized = items
        .filter((item) => item.category === "personalized_water" && PERSONALIZED_SKUS.includes(item.sku))
        .sort((a, b) => a.price - b.price);
      const cheapest = personalized[0];
      return cheapest ? `From ${fmtPrice(cheapest.price)} / case` : "From P144 / case";
    }
    case "ice": {
      if (hasIceCatalogProduct(items)) {
        const iceProducts = items.filter((item) => item.sku.startsWith("FWM-ICE")).sort((a, b) => a.price - b.price);
        const cheapest = iceProducts[0];
        return cheapest ? `From ${fmtPrice(cheapest.price)}` : "Contact for quote";
      }
      return "Contact for quote";
    }
    default:
      return "";
  }
}

export function getServiceCardsWithPrices(catalog: PriceItem[] = []) {
  return SERVICE_CARDS.map((card) => ({
    ...card,
    price: buildServicePriceLabel(card.type, catalog)
  }));
}
