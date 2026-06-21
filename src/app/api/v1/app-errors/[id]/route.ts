import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/require-staff";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const { data, error } = await supabase.from("app_errors").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
