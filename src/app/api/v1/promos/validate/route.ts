import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateDiscountAmount, normalizePromoRow, validatePromoEligibility } from "@/modules/orders/customer-order";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });

  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  const total = Number(request.nextUrl.searchParams.get("total") ?? 0);
  if (!code) return NextResponse.json({ error: "Enter a promo code." }, { status: 400 });

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Promo code was not found." }, { status: 404 });

  const promo = normalizePromoRow(data);
  const eligibility = validatePromoEligibility(promo);
  if (!eligibility.ok) return NextResponse.json({ error: eligibility.reason }, { status: 409 });

  return NextResponse.json({ data: { promo, discountAmount: calculateDiscountAmount(total, promo) } });
}
