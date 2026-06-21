import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit/audit";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { inventoryItemSchema, normalizeInventoryItemRow } from "@/modules/inventory/inventory";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: (data ?? []).map((item) => normalizeInventoryItemRow(item)) });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const parsed = inventoryItemSchema.safeParse(await request.json());
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inventory item", details: parsed.error.flatten() }, { status: 400 });
  }

  const payload = {
    sku: parsed.data.sku,
    name: parsed.data.name,
    category: parsed.data.category,
    unit: parsed.data.unit,
    current_quantity: parsed.data.currentQuantity,
    reorder_point: parsed.data.reorderPoint
  };

  const query = parsed.data.id
    ? supabase.from("inventory_items").update(payload).eq("id", parsed.data.id).select("*").single()
    : supabase.from("inventory_items").insert(payload).select("*").single();

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, "inventory_update", { staff: auth.staff, entityType: "inventory_item", entityId: data.id, details: { sku: data.sku, quantity: data.current_quantity } });

  return NextResponse.json({ data: normalizeInventoryItemRow(data) });
}
