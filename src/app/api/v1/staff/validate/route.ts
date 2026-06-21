import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { staffSessionCookie, validateStaffSessionToken } from "@/lib/staff/session";
import type { StaffRole } from "@/modules/staff/staff";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ ok: false }, { status: 503 });

  const allowed = request.nextUrl.searchParams.get("allowed")?.split(",") as StaffRole[] | undefined;
  const staff = await validateStaffSessionToken(supabase, request.cookies.get(staffSessionCookie)?.value);

  if (!staff || (allowed && !allowed.includes(staff.role))) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  return NextResponse.json({ ok: true, staff });
}
