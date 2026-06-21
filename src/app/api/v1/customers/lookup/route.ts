import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAppError } from "@/lib/errors/log-app-error";
import { normalizeBotswanaPhone } from "@/lib/phone";
import {
  CustomerOrder,
  normalizeCustomerPointsRow,
  normalizeOrderRow
} from "@/modules/orders/customer-order";

export type CustomerLookupResult = {
  phone: string;
  customerName: string;
  orderCount: number;
  points: number;
  lastOrder: CustomerOrder | null;
  preferredDeliveryAddress?: string;
  preferredDeliverySlot?: string;
  preferredFulfillmentType?: "pickup" | "delivery";
};

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");

  if (!phone?.trim()) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const normalizedPhone = normalizeBotswanaPhone(phone);

  const { data: orders, error: ordersError } = await supabase
    .from("customer_orders")
    .select("*")
    .eq("phone_number", normalizedPhone)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(10);

  if (ordersError) {
    await logAppError(supabase, "GET /api/v1/customers/lookup", ordersError);
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const { count: orderCount, error: countError } = await supabase
    .from("customer_orders")
    .select("*", { count: "exact", head: true })
    .eq("phone_number", normalizedPhone)
    .neq("status", "cancelled");

  if (countError) {
    await logAppError(supabase, "GET /api/v1/customers/lookup count", countError);
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const { data: pointsRow } = await supabase
    .from("customer_points")
    .select("*")
    .eq("phone_number", normalizedPhone)
    .maybeSingle();

  const normalizedOrders = (orders ?? []).map((row) => normalizeOrderRow(row));
  const lastOrder = normalizedOrders[0] ?? null;
  const points = pointsRow ? normalizeCustomerPointsRow(pointsRow).points : 0;

  const result: CustomerLookupResult = {
    phone: normalizedPhone,
    customerName: lastOrder?.customerName ?? pointsRow?.customer_name ?? "",
    orderCount: orderCount ?? normalizedOrders.length,
    points,
    lastOrder,
    preferredDeliveryAddress: lastOrder?.deliveryAddress,
    preferredDeliverySlot: lastOrder?.deliverySlot,
    preferredFulfillmentType: lastOrder?.fulfillmentType
  };

  return NextResponse.json({ data: result });
}
