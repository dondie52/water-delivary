import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/require-staff";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }
  const auth = await requireStaffRole(request, supabase, ["admin"]);
  if ("response" in auth) return auth.response;

  const [
    products,
    pickupLocations,
    deliverySlots,
    inventory,
    completedOrders,
    settings
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("pickup_locations").select("id", { count: "exact", head: true }),
    supabase.from("delivery_slots").select("id", { count: "exact", head: true }),
    supabase.from("inventory_items").select("id", { count: "exact", head: true }),
    supabase.from("customer_orders").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("pilot_settings").select("key,value")
  ]);

  const whatsappSetting = settings.data?.find((row) => row.key === "whatsappNumber")?.value;

  return NextResponse.json({
    data: [
      { label: "Supabase connected", pass: true },
      { label: "Products seeded", pass: (products.count ?? 0) > 0 },
      { label: "Pickup locations seeded", pass: (pickupLocations.count ?? 0) > 0 },
      { label: "Delivery slots seeded", pass: (deliverySlots.count ?? 0) > 0 },
      { label: "Admin password set", pass: Boolean(process.env.ADMIN_PASSWORD) },
      { label: "Driver password set", pass: Boolean(process.env.DRIVER_PASSWORD) },
      { label: "Inventory seeded", pass: (inventory.count ?? 0) > 0 },
      { label: "Test order completed", pass: (completedOrders.count ?? 0) > 0 },
      { label: "WhatsApp number confirmed", pass: Boolean(whatsappSetting) }
    ]
  });
}
