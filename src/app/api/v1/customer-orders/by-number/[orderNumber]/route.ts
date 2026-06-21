import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeCustomerPointsRow, normalizeOrderRow, normalizeStatusEventRow } from "@/modules/orders/customer-order";

export async function GET(_request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const { orderNumber } = await params;
  const { data: order, error: orderError } = await supabase
    .from("customer_orders")
    .select("*")
    .eq("order_number", decodeURIComponent(orderNumber))
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 404 });
  }

  const { data: events, error: eventsError } = await supabase
    .from("order_status_events")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false });

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  const { data: points } = await supabase
    .from("customer_points")
    .select("*")
    .eq("phone_number", order.phone_number)
    .maybeSingle();

  return NextResponse.json({
    data: {
      order: {
        ...normalizeOrderRow(order),
        customerPoints: points ? normalizeCustomerPointsRow(points) : undefined
      },
      events: (events ?? []).map((event) => normalizeStatusEventRow(event))
    }
  });
}
