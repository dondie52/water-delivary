import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit/audit";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { loadPilotSettings } from "@/lib/settings/load-pilot-settings";
import { pilotSettingsSchema, settingsToRows } from "@/modules/settings/pilot-settings";

export async function GET() {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  return NextResponse.json({ data: await loadPilotSettings(supabase) });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const parsed = pilotSettingsSchema.safeParse(await request.json());
  const auth = await requireStaffRole(request, supabase, ["admin"]);
  if ("response" in auth) return auth.response;

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings", details: parsed.error.flatten() }, { status: 400 });
  }

  const { error } = await supabase
    .from("pilot_settings")
    .upsert(settingsToRows(parsed.data).map((row) => ({ ...row, updated_at: new Date().toISOString() })), { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, "settings_update", { staff: auth.staff, entityType: "pilot_settings", details: parsed.data });
  return NextResponse.json({ data: parsed.data });
}
