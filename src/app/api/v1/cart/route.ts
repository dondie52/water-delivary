import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireCustomer } from "@/lib/customer/session";
import { logAppError } from "@/lib/errors/log-app-error";
import { createAdminClient } from "@/lib/supabase/admin";
import { cartItemInputSchema, normalizeCartItemRow } from "@/modules/customer/profile";

export async function GET() {
  const { customer, response } = await requireCustomer();
  if (response) return response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_cart_items")
    .select("*")
    .eq("user_id", customer.userId)
    .order("updated_at", { ascending: false });

  if (error) {
    const admin = createAdminClient();
    if (admin) await logAppError(admin, "GET /api/v1/cart", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: (data ?? []).map((row) => normalizeCartItemRow(row)) });
}

export async function POST(request: NextRequest) {
  const { customer, response } = await requireCustomer();
  if (response) return response;

  const body = await request.json();
  const parsed = cartItemInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart item.", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const item = parsed.data;

  const { data, error } = await supabase
    .from("customer_cart_items")
    .upsert(
      {
        user_id: customer.userId,
        sku: item.sku,
        service_type: item.serviceType,
        quantity: item.quantity,
        refill_litres: item.refillLitres,
        container_count: item.containerCount,
        product_name: item.productName,
        unit_price: item.unitPrice
      },
      { onConflict: "user_id,sku" }
    )
    .select("*")
    .single();

  if (error) {
    const admin = createAdminClient();
    if (admin) await logAppError(admin, "POST /api/v1/cart", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: normalizeCartItemRow(data) });
}

export async function DELETE() {
  const { customer, response } = await requireCustomer();
  if (response) return response;

  const supabase = await createClient();
  const { error } = await supabase.from("customer_cart_items").delete().eq("user_id", customer.userId);

  if (error) {
    const admin = createAdminClient();
    if (admin) await logAppError(admin, "DELETE /api/v1/cart", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
