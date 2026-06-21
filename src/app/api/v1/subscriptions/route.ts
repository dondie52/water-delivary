import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { normalizeBotswanaPhone } from "@/lib/phone";
import { normalizeSubscription, subscriptionSchema } from "@/modules/growth/growth";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;
  const { data, error } = await supabase.from("customer_subscriptions").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: (data ?? []).map(normalizeSubscription) });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const parsed = subscriptionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid subscription request.", details: parsed.error.flatten() }, { status: 400 });
  const { data, error } = await supabase.from("customer_subscriptions").insert({
    phone: normalizeBotswanaPhone(parsed.data.phone),
    customer_name: parsed.data.customerName,
    product_preference: parsed.data.productPreference,
    frequency: parsed.data.frequency,
    preferred_slot: parsed.data.preferredSlot,
    fulfillment_type: parsed.data.fulfillmentType,
    notes: parsed.data.notes
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: normalizeSubscription(data) }, { status: 201 });
}
