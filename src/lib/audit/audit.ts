import type { SupabaseClient } from "@supabase/supabase-js";
import type { StaffSession } from "@/modules/staff/staff";

export async function writeAuditLog(
  supabase: SupabaseClient,
  action: string,
  options: {
    entityType?: string;
    entityId?: string;
    staff?: StaffSession | null;
    details?: Record<string, unknown>;
  } = {}
) {
  await supabase.from("audit_logs").insert({
    action,
    entity_type: options.entityType,
    entity_id: options.entityId,
    staff_id: options.staff?.emergency ? null : options.staff?.id,
    staff_name: options.staff?.name,
    staff_role: options.staff?.role,
    details: options.details ?? {}
  });
}
