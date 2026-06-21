import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit/audit";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { normalizeSubscription, subscriptionStatuses } from "@/modules/growth/growth";

const schema = z.object({ status: z.enum(subscriptionStatuses) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid subscription status." }, { status: 400 });
  const { id } = await params;
  const { data, error } = await supabase.from("customer_subscriptions").update({ status: parsed.data.status }).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAuditLog(supabase, "subscription_status_update", { staff: auth.staff, entityType: "subscription", entityId: id, details: { status: parsed.data.status } });
  return NextResponse.json({ data: normalizeSubscription(data) });
}
