import type { ServiceType } from "@/lib/orders/order-wizard";
import { BRAND_ASSETS } from "@/lib/brand-assets";

export function productImageForService(service: ServiceType): string {
  switch (service) {
    case "refill":
      return BRAND_ASSETS.refill;
    case "bottled":
      return BRAND_ASSETS.bottles;
    case "personalized":
      return BRAND_ASSETS.personalizedBottles;
    case "ice":
      return BRAND_ASSETS.ice;
    default:
      return BRAND_ASSETS.bottles;
  }
}

export function productImageForCartItem(item: { serviceType: ServiceType; sku: string }): string {
  if (item.sku === "FWM-DESIGN-STICKER") {
    return BRAND_ASSETS.personalizedBottles;
  }
  return productImageForService(item.serviceType);
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  refill: "Refill",
  bottled: "Bottled",
  personalized: "Branded",
  ice: "Ice"
};
