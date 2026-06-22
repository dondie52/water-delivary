import type { Metadata } from "next";
import { CustomerOrderForm } from "@/components/order/customer-order-form";

export const metadata: Metadata = {
  title: "Order Water — Fresh Water Market",
  description: "Order water in under a minute. Refills, bottled water, ice, and branded bottles. Pickup around campus or student delivery from P30."
};

export default async function OrderPage({
  searchParams
}: {
  searchParams: Promise<{ phone?: string; reorder?: string; service?: string; mode?: string; from?: string }>;
}) {
  const params = await searchParams;

  return (
    <CustomerOrderForm
      initialPhone={params.phone}
      reorderOrderNumber={params.reorder}
      initialService={params.service ?? (params.mode === "full" ? undefined : params.mode === "refill" ? "refill" : undefined)}
      fromCart={params.from === "cart"}
    />
  );
}
