import { PromosDashboard } from "@/components/admin/promos-dashboard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function PromosPage() {
  return <PromosDashboard />;
}
