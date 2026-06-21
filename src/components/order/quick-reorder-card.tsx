"use client";

import { RotateCcw } from "lucide-react";
import { CustomerButton } from "@/components/customer/customer-button";
import { formatCurrency } from "@/lib/utils";
import { CustomerOrder, formatOrderLineItem } from "@/modules/orders/customer-order";

export function QuickReorderCard({
  customerName,
  lastOrder,
  onOrderAgain
}: {
  customerName: string;
  lastOrder: CustomerOrder;
  onOrderAgain: () => void;
}) {
  const firstName = customerName.split(" ")[0] || customerName;
  const fulfillmentDetail =
    lastOrder.fulfillmentType === "delivery"
      ? lastOrder.deliveryAddress ?? "your address"
      : lastOrder.pickupLocation ?? "campus pickup";

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-cyan-50 to-white p-4 shadow-sm ring-1 ring-primary/10">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">Welcome back</p>
      <p className="mt-1 text-lg font-black text-slate-950">{firstName}</p>
      <p className="mt-3 text-sm font-semibold text-slate-500">Last order</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{formatOrderLineItem(lastOrder)}</p>
      <p className="mt-2 text-sm text-slate-600">
        {lastOrder.fulfillmentType === "delivery" ? "Deliver to" : "Pickup at"}:{" "}
        <span className="font-semibold text-slate-900">{fulfillmentDetail}</span>
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Total: <span className="font-bold text-primary">{formatCurrency(lastOrder.total)}</span>
      </p>
      <CustomerButton type="button" className="mt-4 w-full gap-2" onClick={onOrderAgain}>
        <RotateCcw className="h-4 w-4" />
        Repeat last order
      </CustomerButton>
    </div>
  );
}
