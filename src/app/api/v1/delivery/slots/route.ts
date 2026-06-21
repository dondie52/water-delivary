import { NextResponse } from "next/server";
import { deliverySlots, pickupLocations } from "@/modules/catalog/pricing";

export async function GET() {
  return NextResponse.json({
    data: {
      deliverySlots,
      pickupLocations
    }
  });
}
