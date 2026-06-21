import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { normalizePromoRow } from "@/modules/orders/customer-order";

const promoSchema = z.object({
  code: z.string().min(2).max(40),
  discountType: z.enum(["fixed", "percent"]),
  value: z.coerce.number().min(0),
  active: z.boolean(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  usageLimit: z.coerce.number().int().min(0).optional().nullable()
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  const { data, error } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: (data ?? []).map(normalizePromoRow) });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  const parsed = promoSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid promo code", details: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase
    .from("promo_codes")
    .upsert({
      code: parsed.data.code.trim().toUpperCase(),
      discount_type: parsed.data.discountType,
      value: parsed.data.value,
      active: parsed.data.active,
      starts_at: parsed.data.startsAt || null,
      ends_at: parsed.data.endsAt || null,
      usage_limit: parsed.data.usageLimit ?? null
    }, { onConflict: "code" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: normalizePromoRow(data) }, { status: 201 });
}
