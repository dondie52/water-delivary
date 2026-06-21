import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadPilotSettings } from "@/lib/settings/load-pilot-settings";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { normalizeBotswanaPhone } from "@/lib/phone";
import { logAppError } from "@/lib/errors/log-app-error";
import { normalizeProductRow, priceBook } from "@/modules/catalog/pricing";
import {
  buildWhatsappMessage,
  calculateOrderTotal,
  generateOrderNumber,
  normalizePromoRow,
  normalizeOrderRow,
  orderFormSchema,
  orderStatuses,
  validatePromoEligibility
} from "@/modules/orders/customer-order";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const phone = request.nextUrl.searchParams.get("phone");
  const orderNumber = request.nextUrl.searchParams.get("orderNumber");
  let query = supabase
    .from("customer_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (orderNumber) {
    query = query.eq("order_number", orderNumber).limit(1);
  }

  if (phone) {
    query = query.eq("phone_number", normalizeBotswanaPhone(phone)).limit(10);
  }

  if (!phone && !orderNumber) {
    const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
    if ("response" in auth) return auth.response;
  }

  if (status && orderStatuses.includes(status as (typeof orderStatuses)[number])) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    await logAppError(supabase, "GET /api/v1/customer-orders", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: (data ?? []).map((row) => normalizeOrderRow(row))
  });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const body = await request.json();
  const parsed = orderFormSchema.safeParse({ paymentMethod: "cash", ...body });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order", details: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await loadPilotSettings(supabase);
  const normalizedPhone = normalizeBotswanaPhone(parsed.data.phoneNumber);
  const normalizedReferralPhone = parsed.data.referredByPhone?.trim() ? normalizeBotswanaPhone(parsed.data.referredByPhone) : null;

  if (!settings.pilotActive) {
    return NextResponse.json({ error: settings.orderCutoffMessage }, { status: 403 });
  }

  const { data: productRow } = await supabase
    .from("products")
    .select("id, sku, name, category, unit, volume_litres, case_size, active")
    .eq("sku", parsed.data.productSku)
    .eq("active", true)
    .maybeSingle();
  let product = productRow ? normalizeProductRow(productRow) : null;

  if (!product) {
    const fallback = priceBook.find((item) => item.sku === parsed.data.productSku && item.active !== false);
    if (!fallback) return NextResponse.json({ error: "Selected product is not available." }, { status: 400 });
    product = fallback;
  }

  if (productRow?.id) {
    const { data: priceBookRow } = await supabase.from("price_books").select("id").eq("name", "Retail BWP 2026").eq("segment", "retail").maybeSingle();
    const { data: priceRow } = priceBookRow?.id
      ? await supabase.from("price_book_items").select("unit_price").eq("price_book_id", priceBookRow.id).eq("product_id", productRow.id).eq("minimum_quantity", 1).maybeSingle()
      : { data: null };
    product = product ? { ...product, price: Number(priceRow?.unit_price ?? product.price ?? 0) } : product;
  }

  let promo = null;
  if (parsed.data.promoCode?.trim()) {
    const { data: promoRow } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", parsed.data.promoCode.trim().toUpperCase())
      .maybeSingle();

    if (!promoRow) return NextResponse.json({ error: "Promo code was not found." }, { status: 404 });
    const normalizedPromo = normalizePromoRow(promoRow);
    const eligibility = validatePromoEligibility(normalizedPromo);
    if (!eligibility.ok) return NextResponse.json({ error: eligibility.reason }, { status: 409 });
    promo = normalizedPromo;
  }

  const totals = calculateOrderTotal(parsed.data, settings, product ? [product] : priceBook, promo);

  if (!totals.selectedProduct) {
    return NextResponse.json({ error: "Selected product was not found." }, { status: 400 });
  }

  if (parsed.data.fulfillmentType === "delivery" && parsed.data.deliverySlot) {
    const { count } = await supabase
      .from("customer_orders")
      .select("*", { count: "exact", head: true })
      .eq("fulfillment_type", "delivery")
      .eq("delivery_slot", parsed.data.deliverySlot)
      .eq("requested_fulfillment_date", parsed.data.requestedFulfillmentDate)
      .neq("status", "cancelled");

    if ((count ?? 0) >= settings.defaultSlotCapacity) {
      return NextResponse.json({ error: "That delivery slot is full. Please choose another slot." }, { status: 409 });
    }
  }

  const orderNumber = generateOrderNumber();
  const whatsappMessage = buildWhatsappMessage({
    ...parsed.data,
    orderNumber,
    productName: totals.selectedProduct.name,
    total: totals.total
  }, settings);

  const payload = {
    order_number: orderNumber,
    product_sku: totals.selectedProduct.sku,
    product_name: totals.selectedProduct.name,
    product_unit_price: totals.productUnitPrice,
    quantity: parsed.data.quantity,
    refill_litres: parsed.data.refillLitres,
    fulfillment_type: parsed.data.fulfillmentType,
    pickup_location: parsed.data.fulfillmentType === "pickup" ? parsed.data.pickupLocation : null,
    delivery_slot: parsed.data.fulfillmentType === "delivery" ? parsed.data.deliverySlot : null,
    delivery_address: parsed.data.fulfillmentType === "delivery" ? parsed.data.deliveryAddress : null,
    customer_notes: parsed.data.customerNotes ?? null,
    container_count: parsed.data.containerCount,
    large_container_count: parsed.data.largeContainerCount,
    order_type: parsed.data.orderType,
    sticker_design_required: parsed.data.stickerDesignRequired,
    branding_text: parsed.data.brandingText ?? null,
    event_name: parsed.data.eventName ?? null,
    design_notes: parsed.data.designNotes ?? null,
    artwork_url: parsed.data.artworkUrl ?? null,
    personalized_stage: parsed.data.orderType === "personalized" ? "design_pending" : null,
    customer_name: parsed.data.customerName,
    phone_number: normalizedPhone,
    requested_fulfillment_date: parsed.data.requestedFulfillmentDate,
    payment_method: parsed.data.paymentMethod ?? "cash",
    subtotal: totals.subtotal,
    refill_total: totals.refillTotal,
    delivery_fee: totals.deliveryFee,
    extra_handling_fee: totals.extraHandlingFee,
    promo_code: promo?.code ?? null,
    discount_amount: totals.discountAmount,
    referred_by_phone: normalizedReferralPhone,
    total: totals.total,
    status: "pending",
    payment_status: "unpaid",
    whatsapp_message: whatsappMessage
  };

  const { data, error } = await supabase
    .from("customer_orders")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    await logAppError(supabase, "POST /api/v1/customer-orders", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (promo) {
    const { data: redeemed, error: promoError } = await supabase.rpc("redeem_promo_code", { promo_id: promo.id });
    if (promoError || !redeemed) {
      await logAppError(supabase, "POST /api/v1/customer-orders promo redeem", promoError ?? new Error("Promo usage limit reached during checkout."));
    }
  }

  await supabase.from("order_status_events").insert({
    order_id: data.id,
    event_type: "status",
    to_value: "pending",
    changed_by: "customer",
    note: "Order submitted"
  });

  return NextResponse.json({ data: normalizeOrderRow(data) }, { status: 201 });
}
