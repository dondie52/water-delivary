import type { CartItemRecord } from "@/modules/customer/profile";
import type { OrderFormInput } from "@/modules/orders/customer-order";
import { ICE_INQUIRY_NOTE_PREFIX } from "@/lib/orders/order-wizard";

export function buildOrderPayloadFromCartItem(item: CartItemRecord, base: OrderFormInput): OrderFormInput {
  const isRefill = item.serviceType === "refill";
  const isIceInquiry = item.sku === "FWM-ICE-INQUIRY";

  return {
    ...base,
    productSku: isIceInquiry ? "FWM-BW-500" : item.sku,
    quantity: isRefill ? 0 : Math.max(item.quantity, 1),
    refillLitres: isRefill ? item.refillLitres : 0,
    containerCount: isRefill ? item.containerCount : base.containerCount,
    orderType: item.serviceType === "personalized" ? "personalized" : "standard",
    customerNotes: isIceInquiry
      ? `${ICE_INQUIRY_NOTE_PREFIX} — ${item.quantity} unit(s). Pricing to be confirmed when we contact you.`
      : base.customerNotes
  };
}

export function cartItemLineTotal(item: CartItemRecord) {
  if (item.serviceType === "refill") {
    return item.unitPrice * item.refillLitres;
  }
  return item.unitPrice * Math.max(item.quantity, 1);
}
