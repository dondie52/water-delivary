import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeBotswanaPhone } from "@/lib/phone";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });

  const phone = request.nextUrl.searchParams.get("phone");
  const orderNumber = request.nextUrl.searchParams.get("orderNumber");

  if (!phone && !orderNumber) {
    return NextResponse.json({ error: "Enter a phone number or order number." }, { status: 400 });
  }

  let query = supabase
    .from("customer_orders")
    .select("order_number, status, payment_status, requested_fulfillment_date, delivery_slot")
    .order("created_at", { ascending: false })
    .limit(10);

  if (orderNumber) query = query.eq("order_number", orderNumber);
  if (phone) query = query.eq("phone_number", normalizeBotswanaPhone(phone));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: (data ?? []).map((order) => ({
      orderNumber: String(order.order_number),
      status: String(order.status),
      paymentStatus: String(order.payment_status),
      fulfillmentDate: String(order.requested_fulfillment_date),
      slot: order.delivery_slot ? String(order.delivery_slot) : undefined
    }))
  });
}
