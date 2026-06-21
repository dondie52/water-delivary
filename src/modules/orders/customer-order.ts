import { z } from "zod";
import { deliverySlots, pickupLocations, priceBook, type PriceItem } from "@/modules/catalog/pricing";
import { defaultPilotSettings, type PilotSettings } from "@/modules/settings/pilot-settings";

export const orderStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled"] as const;
export const paymentStatuses = ["unpaid", "paid", "partial"] as const;
export const paymentMethods = ["cash", "orange_money", "bank_transfer"] as const;
export const fulfillmentTypes = ["pickup", "delivery"] as const;
export const whatsappTemplateTypes = ["order_received", "payment_reminder", "order_ready", "out_for_delivery", "completed", "delay_apology"] as const;
export const personalizedStages = ["design_pending", "design_approved", "production", "ready", "completed"] as const;

export type CustomerOrderStatus = (typeof orderStatuses)[number];
export type CustomerPaymentStatus = (typeof paymentStatuses)[number];
export type CustomerPaymentMethod = (typeof paymentMethods)[number];
export type CustomerFulfillmentType = (typeof fulfillmentTypes)[number];

export const orderFormSchema = z.object({
  productSku: z.string().min(1, "Choose a product"),
  quantity: z.coerce.number().int().min(0).max(999),
  refillLitres: z.coerce.number().min(0).max(10000),
  fulfillmentType: z.enum(fulfillmentTypes),
  pickupLocation: z.string().optional(),
  deliverySlot: z.string().optional(),
  requestedFulfillmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deliveryAddress: z.string().max(240).optional(),
  customerNotes: z.string().max(500).optional(),
  containerCount: z.coerce.number().int().min(0).max(1000),
  largeContainerCount: z.coerce.number().int().min(0).max(1000),
  orderType: z.enum(["standard", "personalized"]),
  stickerDesignRequired: z.boolean(),
  brandingText: z.string().max(300).optional(),
  eventName: z.string().max(180).optional(),
  designNotes: z.string().max(1000).optional(),
  artworkUrl: z.string().max(500).optional(),
  customerName: z.string().min(2, "Enter your name").max(120),
  phoneNumber: z.string().min(7, "Enter a phone number").max(30),
  promoCode: z.string().max(40).optional(),
  referredByPhone: z.string().max(30).optional(),
  paymentMethod: z.enum(paymentMethods).optional().default("cash")
}).superRefine((value, ctx) => {
  if (value.quantity === 0 && value.refillLitres === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Add a product quantity or refill litres",
      path: ["quantity"]
    });
  }

  if (value.fulfillmentType === "pickup" && !value.pickupLocation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose a pickup location",
      path: ["pickupLocation"]
    });
  }

  if (value.fulfillmentType === "delivery" && !value.deliverySlot) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose a delivery slot",
      path: ["deliverySlot"]
    });
  }

  if (value.fulfillmentType === "delivery" && !value.deliveryAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter delivery address, room, or landmark",
      path: ["deliveryAddress"]
    });
  }
});

export type OrderFormInput = z.infer<typeof orderFormSchema>;

export type CustomerOrder = OrderFormInput & {
  id: string;
  orderNumber: string;
  productName: string;
  productUnitPrice: number;
  subtotal: number;
  refillTotal: number;
  deliveryFee: number;
  extraHandlingFee: number;
  total: number;
  promoCode?: string;
  discountAmount: number;
  referredByPhone?: string;
  amountPaid: number;
  balanceDue: number;
  paymentReference?: string;
  paymentConfirmedMethod?: CustomerPaymentMethod;
  internalNotes?: string;
  deliveryAddress?: string;
  customerNotes?: string;
  containerCount: number;
  largeContainerCount: number;
  orderType: "standard" | "personalized";
  stickerDesignRequired: boolean;
  brandingText?: string;
  eventName?: string;
  designNotes?: string;
  artworkUrl?: string;
  personalizedStage?: (typeof personalizedStages)[number];
  assignedRunnerName?: string;
  assignedRunnerPhone?: string;
  customerPoints?: CustomerPoints;
  status: CustomerOrderStatus;
  paymentStatus: CustomerPaymentStatus;
  whatsappMessage: string;
  createdAt: string;
  requestedFulfillmentDate: string;
  updatedAt?: string;
};

export type CustomerPoints = {
  phoneNumber: string;
  customerName?: string;
  points: number;
  lifetimeSpend: number;
  referralCount: number;
};

export type OrderStatusEvent = {
  id: string;
  orderId: string;
  eventType: "status" | "payment" | "note";
  fromValue?: string;
  toValue?: string;
  changedBy?: string;
  note?: string;
  createdAt: string;
};

export type PromoCode = {
  id: string;
  code: string;
  discountType: "fixed" | "percent";
  value: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  usedCount: number;
};

export function validatePromoEligibility(promo: PromoCode, now = Date.now()) {
  if (!promo.active) return { ok: false as const, reason: "Promo code is not active." };
  if (promo.startsAt && new Date(promo.startsAt).getTime() > now) return { ok: false as const, reason: "Promo code is not active yet." };
  if (promo.endsAt && new Date(promo.endsAt).getTime() < now) return { ok: false as const, reason: "Promo code has expired." };
  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) return { ok: false as const, reason: "Promo code has reached its usage limit." };
  return { ok: true as const };
}

export function normalizePromoRow(row: Record<string, unknown>): PromoCode {
  return {
    id: String(row.id),
    code: String(row.code),
    discountType: row.discount_type as PromoCode["discountType"],
    value: Number(row.value ?? 0),
    active: Boolean(row.active),
    startsAt: row.starts_at ? String(row.starts_at) : undefined,
    endsAt: row.ends_at ? String(row.ends_at) : undefined,
    usageLimit: row.usage_limit == null ? undefined : Number(row.usage_limit),
    usedCount: Number(row.used_count ?? 0)
  };
}

export function getOrderableProducts(products: PriceItem[] = priceBook) {
  return products.filter((item) => item.active !== false && item.category !== "delivery" && item.category !== "design" && item.category !== "refill");
}

export function calculateDiscountAmount(baseTotal: number, promo?: Pick<PromoCode, "discountType" | "value"> | null) {
  if (!promo || baseTotal <= 0) return 0;
  const rawDiscount = promo.discountType === "percent" ? baseTotal * (promo.value / 100) : promo.value;
  return Math.min(Math.max(rawDiscount, 0), baseTotal);
}

export function calculateOrderTotal(
  input: Pick<OrderFormInput, "productSku" | "quantity" | "refillLitres" | "fulfillmentType" | "largeContainerCount">,
  settings: PilotSettings = defaultPilotSettings,
  products: PriceItem[] = priceBook,
  promo?: Pick<PromoCode, "discountType" | "value"> | null
) {
  const selectedProduct = products.find((item) => item.sku === input.productSku && item.active !== false);
  const productUnitPrice = selectedProduct?.price ?? 0;
  const subtotal = productUnitPrice * input.quantity;
  const refillPrice = settings.refillPricePerLitre;
  const refillTotal = refillPrice * input.refillLitres;
  const deliveryFee = input.fulfillmentType === "delivery" ? settings.studentDeliveryFee : 0;
  const extraHandlingFee = input.largeContainerCount > 4 ? settings.extraHandlingFee : 0;
  const beforeDiscount = subtotal + refillTotal + deliveryFee + extraHandlingFee;
  const discountAmount = calculateDiscountAmount(beforeDiscount, promo);

  return {
    selectedProduct,
    productUnitPrice,
    subtotal,
    refillTotal,
    deliveryFee,
    extraHandlingFee,
    discountAmount,
    total: beforeDiscount - discountAmount
  };
}

export function generateOrderNumber() {
  const date = new Date();
  const day = date.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `FWM-${day}-${suffix}`;
}

export function buildWhatsappMessage(order: Pick<CustomerOrder, "orderNumber" | "customerName" | "phoneNumber" | "productName" | "quantity" | "refillLitres" | "fulfillmentType" | "pickupLocation" | "deliverySlot" | "deliveryAddress" | "paymentMethod" | "total">, settings: PilotSettings = defaultPilotSettings) {
  const fulfillment = order.fulfillmentType === "delivery"
    ? `Delivery: ${order.deliverySlot} | ${order.deliveryAddress}`
    : `Pickup: ${order.pickupLocation}`;

  return [
    `Fresh Water Market order ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phoneNumber}`,
    `Product: ${order.productName} x ${order.quantity}`,
    `Refill: ${order.refillLitres}L`,
    fulfillment,
    `Payment: ${order.paymentMethod.replaceAll("_", " ")}`,
    `Total: P${order.total.toFixed(2)}`,
    `Support: ${settings.whatsappNumber}`
  ].join("\n");
}

export function buildInvoiceSummary(order: Pick<CustomerOrder, "orderNumber" | "customerName" | "phoneNumber" | "productName" | "quantity" | "refillLitres" | "subtotal" | "refillTotal" | "deliveryFee" | "extraHandlingFee" | "discountAmount" | "total" | "amountPaid" | "balanceDue" | "paymentMethod" | "paymentReference">) {
  return [
    `Fresh Water Market invoice ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phoneNumber}`,
    `Items: ${order.productName} x ${order.quantity}`,
    `Refill: ${order.refillLitres}L`,
    `Subtotal: P${order.subtotal.toFixed(2)}`,
    `Refill: P${order.refillTotal.toFixed(2)}`,
    `Delivery: P${order.deliveryFee.toFixed(2)}`,
    `Extra handling: P${order.extraHandlingFee.toFixed(2)}`,
    `Discount: P${order.discountAmount.toFixed(2)}`,
    `Total: P${order.total.toFixed(2)}`,
    `Paid: P${order.amountPaid.toFixed(2)}`,
    `Balance due: P${order.balanceDue.toFixed(2)}`,
    `Payment: ${order.paymentMethod.replaceAll("_", " ")}${order.paymentReference ? ` | Ref ${order.paymentReference}` : ""}`
  ].join("\n");
}

export function buildWhatsappTemplate(type: (typeof whatsappTemplateTypes)[number], order: Pick<CustomerOrder, "orderNumber" | "customerName" | "total" | "balanceDue" | "fulfillmentType" | "pickupLocation" | "deliverySlot">) {
  const location = order.fulfillmentType === "delivery" ? `delivery slot ${order.deliverySlot}` : `pickup at ${order.pickupLocation}`;

  const templates = {
    order_received: `Hi ${order.customerName}, Fresh Water Market received your order ${order.orderNumber}. Total: P${order.total.toFixed(2)}. We will confirm shortly.`,
    payment_reminder: `Hi ${order.customerName}, reminder for order ${order.orderNumber}: balance due is P${order.balanceDue.toFixed(2)}. Please send proof after payment.`,
    order_ready: `Hi ${order.customerName}, your Fresh Water Market order ${order.orderNumber} is ready for ${location}.`,
    out_for_delivery: `Hi ${order.customerName}, your Fresh Water Market order ${order.orderNumber} is out for delivery for ${order.deliverySlot}.`,
    completed: `Hi ${order.customerName}, order ${order.orderNumber} is completed. Thank you for choosing Fresh Water Market.`,
    delay_apology: `Hi ${order.customerName}, sorry for the delay on order ${order.orderNumber}. Our team is working on it and will update you shortly.`
  };

  return templates[type];
}

export function normalizeOrderRow(row: Record<string, unknown>): CustomerOrder {
  return {
    id: String(row.id),
    orderNumber: String(row.order_number),
    productSku: String(row.product_sku),
    productName: String(row.product_name),
    productUnitPrice: Number(row.product_unit_price),
    quantity: Number(row.quantity),
    refillLitres: Number(row.refill_litres),
    fulfillmentType: row.fulfillment_type as CustomerFulfillmentType,
    pickupLocation: row.pickup_location ? String(row.pickup_location) : undefined,
    deliverySlot: row.delivery_slot ? String(row.delivery_slot) : undefined,
    customerName: String(row.customer_name),
    phoneNumber: String(row.phone_number),
    paymentMethod: row.payment_method as CustomerPaymentMethod,
    subtotal: Number(row.subtotal),
    refillTotal: Number(row.refill_total),
    deliveryFee: Number(row.delivery_fee),
    extraHandlingFee: Number(row.extra_handling_fee ?? 0),
    total: Number(row.total),
    promoCode: row.promo_code ? String(row.promo_code) : undefined,
    discountAmount: Number(row.discount_amount ?? 0),
    referredByPhone: row.referred_by_phone ? String(row.referred_by_phone) : undefined,
    amountPaid: Number(row.amount_paid ?? 0),
    balanceDue: Number(row.balance_due ?? row.total ?? 0),
    paymentReference: row.payment_reference ? String(row.payment_reference) : undefined,
    paymentConfirmedMethod: row.payment_confirmed_method ? row.payment_confirmed_method as CustomerPaymentMethod : undefined,
    internalNotes: row.internal_notes ? String(row.internal_notes) : undefined,
    deliveryAddress: row.delivery_address ? String(row.delivery_address) : undefined,
    customerNotes: row.customer_notes ? String(row.customer_notes) : undefined,
    containerCount: Number(row.container_count ?? 0),
    largeContainerCount: Number(row.large_container_count ?? 0),
    orderType: (row.order_type as "standard" | "personalized") ?? "standard",
    stickerDesignRequired: Boolean(row.sticker_design_required),
    brandingText: row.branding_text ? String(row.branding_text) : undefined,
    eventName: row.event_name ? String(row.event_name) : undefined,
    designNotes: row.design_notes ? String(row.design_notes) : undefined,
    artworkUrl: row.artwork_url ? String(row.artwork_url) : undefined,
    personalizedStage: row.personalized_stage ? row.personalized_stage as CustomerOrder["personalizedStage"] : undefined,
    assignedRunnerName: row.assigned_runner_name ? String(row.assigned_runner_name) : undefined,
    assignedRunnerPhone: row.assigned_runner_phone ? String(row.assigned_runner_phone) : undefined,
    status: row.status as CustomerOrderStatus,
    paymentStatus: row.payment_status as CustomerPaymentStatus,
    whatsappMessage: String(row.whatsapp_message),
    createdAt: String(row.created_at),
    requestedFulfillmentDate: String(row.requested_fulfillment_date ?? row.created_at).slice(0, 10),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined
  };
}

export function normalizeCustomerPointsRow(row: Record<string, unknown>): CustomerPoints {
  return {
    phoneNumber: String(row.phone_number),
    customerName: row.customer_name ? String(row.customer_name) : undefined,
    points: Number(row.points ?? 0),
    lifetimeSpend: Number(row.lifetime_spend ?? 0),
    referralCount: Number(row.referral_count ?? 0)
  };
}

export function buildQuickReorderSummary(
  order: Pick<CustomerOrder, "productName" | "quantity" | "refillLitres" | "fulfillmentType" | "deliveryAddress" | "pickupLocation" | "deliverySlot" | "total">,
  settings: PilotSettings = defaultPilotSettings
) {
  const itemLine = order.refillLitres > 0
    ? `${order.refillLitres}L Refill${order.quantity > 0 ? ` + ${order.productName} x ${order.quantity}` : ""}`
    : `${order.productName} x ${order.quantity}`;

  const fulfillmentLine = order.fulfillmentType === "delivery"
    ? `Delivery: ${order.deliveryAddress ?? "your address"}${order.deliverySlot ? ` (${order.deliverySlot})` : ""}`
    : `Pickup: ${order.pickupLocation ?? pickupLocations[0]}`;

  return {
    itemLine,
    fulfillmentLine,
    total: order.total,
    deliveryFee: order.fulfillmentType === "delivery" ? settings.studentDeliveryFee : 0
  };
}

export function formatOrderLineItem(order: Pick<CustomerOrder, "productName" | "quantity" | "refillLitres">) {
  if (order.refillLitres > 0) {
    return order.quantity > 0
      ? `${order.refillLitres}L Refill + ${order.quantity} x ${order.productName}`
      : `${order.refillLitres}L Refill`;
  }
  return `${order.quantity} x ${order.productName}`;
}

export function normalizeStatusEventRow(row: Record<string, unknown>): OrderStatusEvent {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    eventType: row.event_type as OrderStatusEvent["eventType"],
    fromValue: row.from_value ? String(row.from_value) : undefined,
    toValue: row.to_value ? String(row.to_value) : undefined,
    changedBy: row.changed_by ? String(row.changed_by) : undefined,
    note: row.note ? String(row.note) : undefined,
    createdAt: String(row.created_at)
  };
}

export { deliverySlots, pickupLocations };
