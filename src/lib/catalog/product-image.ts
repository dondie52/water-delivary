import type { ServiceType } from "@/lib/orders/order-wizard";
import { BRAND_ASSETS } from "@/lib/brand-assets";

/** Category PNGs ship in /public/brand/categories/; hero JPGs may be absent on deploy. */
export function productImageForService(service: ServiceType): string {
  switch (service) {
    case "refill":
      return BRAND_ASSETS.categories.refill;
    case "bottled":
      return BRAND_ASSETS.categories.bottled;
    case "personalized":
      return BRAND_ASSETS.categories.branded;
    case "ice":
      return BRAND_ASSETS.categories.ice;
    default:
      return BRAND_ASSETS.categories.bottled;
  }
}

export function productImageForCartItem(item: { serviceType: ServiceType; sku: string }): string {
  if (item.sku === "FWM-DESIGN-STICKER") {
    return BRAND_ASSETS.categories.branded;
  }
  return productImageForService(item.serviceType);
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  refill: "Refill",
  bottled: "Bottled",
  personalized: "Branded",
  ice: "Ice"
};
