export type ServiceType = "refill" | "bottled" | "personalized" | "ice";

export type WizardStep = "service" | "product" | "fulfillment" | "contact" | "confirm";

import type { PriceItem } from "@/modules/catalog/pricing";
import type { OrderFormInput } from "@/modules/orders/customer-order";
import type { CustomerOrder } from "@/modules/orders/customer-order";

const BOTTLED_SKUS = ["FWM-BW-250", "FWM-BW-330", "FWM-BW-500", "FWM-BW-1500", "FWM-BW-5000"];
const PERSONALIZED_SKUS = ["FWM-PW-250-24", "FWM-PW-330-24", "FWM-PW-500-24", "FWM-DESIGN-STICKER"];
const CASE_SKUS = ["FWM-CASE-250-24", "FWM-CASE-330-24", "FWM-CASE-500-24"];

export const ICE_INQUIRY_NOTE_PREFIX = "ICE INQUIRY";

export function hasIceCatalogProduct(catalog: PriceItem[]): boolean {
  return catalog.some((item) => item.active !== false && item.sku.startsWith("FWM-ICE"));
}

export function isIceInquiryOrder(order: Pick<CustomerOrder, "customerNotes">): boolean {
  return Boolean(order.customerNotes?.toUpperCase().includes(ICE_INQUIRY_NOTE_PREFIX));
}

export function inferServiceFromOrder(order: CustomerOrder): ServiceType {
  if (order.refillLitres > 0) return "refill";
  if (order.orderType === "personalized") return "personalized";
  if (isIceInquiryOrder(order)) return "ice";
  return "bottled";
}

export function serviceLabel(service: ServiceType): string {
  switch (service) {
    case "refill":
      return "Water Refill";
    case "bottled":
      return "Bottled Water";
    case "personalized":
      return "Personalized Bottles";
    case "ice":
      return "Ice";
    default:
      return "Water";
  }
}

export const WIZARD_STEPS: WizardStep[] = ["service", "product", "fulfillment", "contact", "confirm"];

export const REFILL_SIZES = [5, 10, 20, 25] as const;

export function getProductsForService(service: ServiceType, catalog: PriceItem[]): PriceItem[] {
  const active = catalog.filter((item) => item.active !== false);

  switch (service) {
    case "refill":
      return active.filter((item) => item.sku === "FWM-REFILL-L" || item.category === "refill");
    case "bottled":
      return active.filter((item) => item.category === "bottled_water" && BOTTLED_SKUS.includes(item.sku));
    case "personalized":
      return active.filter(
        (item) =>
          (item.category === "personalized_water" || item.category === "design") &&
          PERSONALIZED_SKUS.includes(item.sku)
      );
    case "ice":
      return active.filter((item) => item.sku.startsWith("FWM-ICE"));
    default:
      return [];
  }
}

export function getCaseProducts(catalog: PriceItem[]): PriceItem[] {
  return catalog.filter((item) => item.active !== false && item.category === "standard_case" && CASE_SKUS.includes(item.sku));
}

export function applyServiceDefaults(service: ServiceType, form: OrderFormInput, catalog: PriceItem[] = []): OrderFormInput {
  switch (service) {
    case "refill":
      return {
        ...form,
        productSku: "FWM-REFILL-L",
        quantity: 0,
        refillLitres: 20,
        containerCount: 1,
        orderType: "standard"
      };
    case "bottled":
      return {
        ...form,
        productSku: "FWM-BW-500",
        quantity: 1,
        refillLitres: 0,
        orderType: "standard"
      };
    case "personalized":
      return {
        ...form,
        productSku: "FWM-PW-500-24",
        quantity: 1,
        refillLitres: 0,
        orderType: "personalized"
      };
    case "ice":
      if (hasIceCatalogProduct(catalog)) {
        const iceProduct = catalog.find((item) => item.sku.startsWith("FWM-ICE"));
        return {
          ...form,
          productSku: iceProduct?.sku ?? "FWM-ICE",
          quantity: 1,
          refillLitres: 0,
          orderType: "standard",
          customerNotes: form.customerNotes?.includes(ICE_INQUIRY_NOTE_PREFIX) ? "" : form.customerNotes
        };
      }
      return {
        ...form,
        productSku: "FWM-BW-500",
        quantity: 1,
        refillLitres: 0,
        orderType: "standard",
        customerNotes: `${ICE_INQUIRY_NOTE_PREFIX} — pricing to be confirmed when we contact you.`
      };
    default:
      return form;
  }
}

export function validateWizardStep(
  step: WizardStep,
  form: OrderFormInput,
  service: ServiceType | null,
  options: { needsName: boolean }
): string | null {
  if (step === "service" && !service) return "Choose a service.";

  if (step === "product") {
    if (service === "refill") {
      if (form.refillLitres <= 0) return "Choose a refill size.";
      return null;
    }
    if (service === "ice") {
      if (form.quantity <= 0) return "Enter how much ice you need.";
      return null;
    }
    if (form.quantity <= 0) return "Choose a quantity.";
    if (!form.productSku) return "Choose a product.";
  }

  if (step === "fulfillment") {
    if (form.fulfillmentType === "pickup" && !form.pickupLocation) return "Choose a pickup point.";
    if (form.fulfillmentType === "delivery" && !form.deliverySlot) return "No delivery slots available.";
    if (form.fulfillmentType === "delivery" && !form.deliveryAddress?.trim()) {
      return "Enter where we should deliver.";
    }
  }

  if (step === "contact") {
    if (!form.phoneNumber.trim()) return "Enter your phone number.";
    if (options.needsName && !form.customerName.trim()) return "Enter your name.";
  }

  return null;
}

export function formatProductLabel(product: PriceItem): string {
  return product.name
    .replace("Fresh Water ", "")
    .replace("Personalized ", "")
    .replace("Standard ", "");
}
