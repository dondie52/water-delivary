import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit/audit";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { hashPin } from "@/lib/staff/session";
import { normalizeBotswanaPhone } from "@/lib/phone";
import { normalizeStaff, staffCreateSchema } from "@/modules/staff/staff";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin"]);
  if ("response" in auth) return auth.response;

  const { data, error } = await supabase.from("staff_users").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: (data ?? []).map((row) => normalizeStaff(row)) });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });

  const parsed = staffCreateSchema.safeParse(await request.json());
  const auth = await requireStaffRole(request, supabase, ["admin"]);
  if ("response" in auth) return auth.response;
  if (!parsed.success) return NextResponse.json({ error: "Invalid staff user.", details: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase.from("staff_users").insert({
    name: parsed.data.name,
    phone: normalizeBotswanaPhone(parsed.data.phone),
    role: parsed.data.role,
    pin_hash: hashPin(parsed.data.pin),
    active: true
  }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAuditLog(supabase, "staff_create", { staff: auth.staff, entityType: "staff_user", entityId: data.id, details: { role: data.role } });
  return NextResponse.json({ data: normalizeStaff(data) }, { status: 201 });
}
