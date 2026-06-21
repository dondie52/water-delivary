import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/require-staff";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
  const staff = request.nextUrl.searchParams.get("staff");
  const action = request.nextUrl.searchParams.get("action");
  const entityType = request.nextUrl.searchParams.get("entityType");
  const date = request.nextUrl.searchParams.get("date");
  if (staff) query = query.ilike("staff_name", `%${staff}%`);
  if (action) query = query.eq("action", action);
  if (entityType) query = query.eq("entity_type", entityType);
  if (date) query = query.gte("created_at", `${date}T00:00:00.000Z`).lt("created_at", `${date}T23:59:59.999Z`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
