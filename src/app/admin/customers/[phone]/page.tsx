import { CustomerDetail } from "@/components/admin/customer-detail";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  return <CustomerDetail phone={decodeURIComponent(phone)} />;
}
