import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit/audit";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { normalizeBotswanaPhone } from "@/lib/phone";

const schema = z.object({
  phoneNumber: z.string().min(4).max(30),
  note: z.string().min(1).max(1000)
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;
  const phone = request.nextUrl.searchParams.get("phone");
  let query = supabase.from("customer_notes").select("*").order("created_at", { ascending: false });
  if (phone) query = query.eq("phone_number", normalizeBotswanaPhone(phone));
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid customer note." }, { status: 400 });
  const staff = auth.staff;
  const { data, error } = await supabase.from("customer_notes").insert({
    phone_number: normalizeBotswanaPhone(parsed.data.phoneNumber),
    note: parsed.data.note,
    staff_name: staff?.name
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAuditLog(supabase, "customer_note_create", { staff, entityType: "customer", entityId: normalizeBotswanaPhone(parsed.data.phoneNumber) });
  return NextResponse.json({ data }, { status: 201 });
}
