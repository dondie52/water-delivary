import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadPilotSettings } from "@/lib/settings/load-pilot-settings";
import { deliverySlots } from "@/modules/catalog/pricing";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const settings = await loadPilotSettings(supabase);
  const today = new Date().toISOString().slice(0, 10);
  const requestedDate = request.nextUrl.searchParams.get("date") ?? today;
  const { data: orders } = await supabase
    .from("customer_orders")
    .select("delivery_slot,created_at,status")
    .eq("fulfillment_type", "delivery")
    .eq("requested_fulfillment_date", requestedDate)
    .neq("status", "cancelled");

  const slots = deliverySlots.map((slot) => {
    const used = (orders ?? []).filter((order) => order.delivery_slot === slot.label).length;
    const capacity = settings.defaultSlotCapacity;
    return {
      ...slot,
      capacity,
      used,
      isFull: used >= capacity,
      isPast: requestedDate === today && isSlotPast(slot.endsAt)
    };
  });

  return NextResponse.json({
    data: {
      settings,
      slots,
      todayOrderingClosed: slots.every((slot) => slot.isPast)
    }
  });
}

function isSlotPast(endsAt: string) {
  const now = new Date();
  const [hours, minutes] = endsAt.split(":").map(Number);
  const slotEnd = new Date();
  slotEnd.setHours(hours, minutes, 0, 0);
  return now > slotEnd;
}
