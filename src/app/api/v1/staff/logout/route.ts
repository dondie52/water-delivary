import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clearStaffSessionCookie, revokeStaffSession, staffSessionCookie } from "@/lib/staff/session";

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (supabase) {
    await revokeStaffSession(supabase, request.cookies.get(staffSessionCookie)?.value);
  }
  const response = NextResponse.json({ ok: true });
  clearStaffSessionCookie(response);
  return response;
}
