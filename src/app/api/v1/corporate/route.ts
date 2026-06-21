import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { normalizeBotswanaPhone } from "@/lib/phone";
import { corporateSchema, normalizeCorporate } from "@/modules/growth/growth";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;
  const { data, error } = await supabase.from("corporate_clients").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: (data ?? []).map(normalizeCorporate) });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const parsed = corporateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid corporate inquiry.", details: parsed.error.flatten() }, { status: 400 });
  const { data, error } = await supabase.from("corporate_clients").insert({
    company_name: parsed.data.companyName,
    contact_person: parsed.data.contactPerson,
    phone: normalizeBotswanaPhone(parsed.data.phone),
    email: parsed.data.email || null,
    use_case: parsed.data.useCase,
    bottle_size: parsed.data.bottleSize,
    quantity: parsed.data.quantity,
    branding_required: parsed.data.brandingRequired,
    notes: parsed.data.notes
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: normalizeCorporate(data) }, { status: 201 });
}
