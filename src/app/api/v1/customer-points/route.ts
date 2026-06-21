import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/require-staff";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;
  const { data, error } = await supabase.from("customer_points").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
