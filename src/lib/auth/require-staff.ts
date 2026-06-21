import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getRolePassword } from "@/lib/auth/password-gates";
import { staffSessionCookie, validateStaffSessionToken } from "@/lib/staff/session";
import type { StaffRole, StaffSession } from "@/modules/staff/staff";

export async function requireStaffRole(
  request: NextRequest,
  supabase: SupabaseClient,
  allowedRoles: StaffRole[]
): Promise<{ staff: StaffSession } | { response: NextResponse }> {
  const staff = await validateStaffSessionToken(supabase, request.cookies.get(staffSessionCookie)?.value);

  if (staff && allowedRoles.includes(staff.role)) {
    return { staff };
  }

  const adminPassword = getRolePassword("admin");
  const driverPassword = getRolePassword("driver");
  const adminEmergency = request.cookies.get("fwm_admin")?.value === adminPassword;
  const driverEmergency = request.cookies.get("fwm_driver")?.value === driverPassword;

  if (adminEmergency && (allowedRoles.includes("admin") || allowedRoles.includes("manager"))) {
    return { staff: { id: "emergency-admin", name: "Emergency Admin", phone: "", role: "admin", emergency: true } };
  }

  if (driverEmergency && allowedRoles.includes("driver")) {
    return { staff: { id: "emergency-driver", name: "Emergency Driver", phone: "", role: "driver", emergency: true } };
  }

  return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
}
