import { TrackOrders } from "@/components/order/track-orders";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function TrackPage() {
  return <TrackOrders />;
}
