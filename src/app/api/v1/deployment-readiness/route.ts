import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/require-staff";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin"]);
  if ("response" in auth) return auth.response;
  const [products, slots, pickups, migrations] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("delivery_slots").select("id", { count: "exact", head: true }),
    supabase.from("pickup_locations").select("id", { count: "exact", head: true }),
    supabase.from("pilot_settings").select("key", { count: "exact", head: true })
  ]);
  return NextResponse.json({
    data: {
      env: {
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
        DRIVER_PASSWORD: Boolean(process.env.DRIVER_PASSWORD)
      },
      supabaseConnected: !products.error,
      migrationCheck: (migrations.count ?? 0) > 0 ? "pilot_settings present through Phase 4+" : "check migrations manually",
      seed: {
        products: products.count ?? 0,
        deliverySlots: slots.count ?? 0,
        pickupLocations: pickups.count ?? 0
      }
    }
  });
}
