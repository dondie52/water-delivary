import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit/audit";
import { createStaffSession, setStaffSessionCookie, verifyPin } from "@/lib/staff/session";
import { normalizeBotswanaPhone } from "@/lib/phone";
import { normalizeStaff, staffLoginSchema } from "@/modules/staff/staff";

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const parsed = staffLoginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid phone and PIN." }, { status: 400 });
  }

  const { data: staff, error } = await supabase
    .from("staff_users")
    .select("*")
    .eq("phone", normalizeBotswanaPhone(parsed.data.phone))
    .eq("active", true)
    .single();

  if (error || !staff || !verifyPin(parsed.data.pin, staff.pin_hash)) {
    return NextResponse.json({ error: "Invalid staff login." }, { status: 401 });
  }

  const normalized = normalizeStaff(staff);
  const session = {
    id: normalized.id,
    name: normalized.name,
    phone: normalized.phone,
    role: normalized.role
  };
  const token = await createStaffSession(supabase, session);
  const response = NextResponse.json({ data: session });
  setStaffSessionCookie(response, { ...session, id: token });
  await writeAuditLog(supabase, "login", { staff: session, entityType: "staff_user", entityId: session.id });
  return response;
}
