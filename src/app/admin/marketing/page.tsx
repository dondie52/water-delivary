import { MarketingDashboard } from "@/components/admin/marketing-dashboard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function MarketingPage() {
  return <MarketingDashboard />;
}
