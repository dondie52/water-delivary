import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireCustomer } from "@/lib/customer/session";
import { logAppError } from "@/lib/errors/log-app-error";
import { createAdminClient } from "@/lib/supabase/admin";
import { cartItemInputSchema, normalizeCartItemRow } from "@/modules/customer/profile";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { customer, response } = await requireCustomer();
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const parsed = cartItemInputSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart update.", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const update: Record<string, unknown> = {};

  if (parsed.data.quantity != null) update.quantity = parsed.data.quantity;
  if (parsed.data.refillLitres != null) update.refill_litres = parsed.data.refillLitres;
  if (parsed.data.containerCount != null) update.container_count = parsed.data.containerCount;

  const { data, error } = await supabase
    .from("customer_cart_items")
    .update(update)
    .eq("id", id)
    .eq("user_id", customer.userId)
    .select("*")
    .maybeSingle();

  if (error) {
    const admin = createAdminClient();
    if (admin) await logAppError(admin, "PATCH /api/v1/cart/[id]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }

  return NextResponse.json({ data: normalizeCartItemRow(data) });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { customer, response } = await requireCustomer();
  if (response) return response;

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("customer_cart_items").delete().eq("id", id).eq("user_id", customer.userId);

  if (error) {
    const admin = createAdminClient();
    if (admin) await logAppError(admin, "DELETE /api/v1/cart/[id]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
