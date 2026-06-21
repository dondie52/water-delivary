import { deliverySlots, pickupLocations } from "@/modules/catalog/pricing";
import type { CustomerOrder, OrderFormInput } from "@/modules/orders/customer-order";

export type SlotAvailability = {
  label: string;
  isFull: boolean;
  isPast: boolean;
  used: number;
  capacity: number;
};

export function getNextAvailableSlot(slots: SlotAvailability[]): string | null {
  const available = slots.find((slot) => !slot.isFull && !slot.isPast);
  return available?.label ?? deliverySlots[0]?.label ?? null;
}

export function getDefaultFulfillmentDate(todayOrderingClosed: boolean): string {
  if (todayOrderingClosed) {
    return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function buildReorderInput(
  lastOrder: CustomerOrder,
  nextSlot: string | null,
  fulfillmentDate: string
): OrderFormInput {
  return {
    productSku: lastOrder.productSku,
    quantity: lastOrder.quantity,
    refillLitres: lastOrder.refillLitres,
    fulfillmentType: lastOrder.fulfillmentType,
    pickupLocation: lastOrder.pickupLocation ?? pickupLocations[0],
    deliverySlot: lastOrder.fulfillmentType === "delivery" ? (nextSlot ?? lastOrder.deliverySlot ?? deliverySlots[0].label) : undefined,
    requestedFulfillmentDate: fulfillmentDate,
    deliveryAddress: lastOrder.deliveryAddress ?? "",
    customerNotes: "",
    containerCount: lastOrder.containerCount,
    largeContainerCount: lastOrder.largeContainerCount,
    orderType: lastOrder.orderType,
    stickerDesignRequired: lastOrder.stickerDesignRequired,
    brandingText: lastOrder.brandingText ?? "",
    eventName: lastOrder.eventName ?? "",
    designNotes: lastOrder.designNotes ?? "",
    artworkUrl: "",
    customerName: lastOrder.customerName,
    phoneNumber: lastOrder.phoneNumber,
    promoCode: "",
    referredByPhone: "",
    paymentMethod: "cash"
  };
}
