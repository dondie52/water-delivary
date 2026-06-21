import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit/audit";
import { requireStaffRole } from "@/lib/auth/require-staff";

const feedbackSchema = z.object({
  orderNumber: z.string().min(3),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  const { data, error } = await supabase
    .from("order_feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, "feedback_review", { staff: auth.staff, entityType: "feedback" });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const parsed = feedbackSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose a rating from 1 to 5.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabase
    .from("customer_orders")
    .select("id,order_number")
    .eq("order_number", parsed.data.orderNumber)
    .single();

  if (orderError) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { error } = await supabase.from("order_feedback").upsert({
    order_id: order.id,
    order_number: order.order_number,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null
  }, { onConflict: "order_number" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
