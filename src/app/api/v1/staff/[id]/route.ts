import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit/audit";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { hashPin } from "@/lib/staff/session";
import { normalizeStaff, staffUpdateSchema } from "@/modules/staff/staff";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin"]);
  if ("response" in auth) return auth.response;

  const parsed = staffUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid staff update.", details: parsed.error.flatten() }, { status: 400 });

  const { id } = await params;
  const update: Record<string, string | boolean> = {};
  if (parsed.data.name) update.name = parsed.data.name;
  if (parsed.data.role) update.role = parsed.data.role;
  if (parsed.data.active !== undefined) update.active = parsed.data.active;
  if (parsed.data.pin) update.pin_hash = hashPin(parsed.data.pin);

  const { data, error } = await supabase.from("staff_users").update(update).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAuditLog(supabase, parsed.data.pin ? "staff_pin_reset" : "staff_update", { staff: auth.staff, entityType: "staff_user", entityId: id, details: update });
  return NextResponse.json({ data: normalizeStaff(data) });
}
