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
    <div className="rounded-xl border border-primary/20 bg-aqua/45 p-4">
      <p className="text-sm font-semibold text-primary">Welcome back, {firstName}</p>
      <p className="mt-3 text-sm font-semibold text-muted-foreground">Last order</p>
      <p className="mt-1 text-sm font-bold text-foreground">{formatOrderLineItem(lastOrder)}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {lastOrder.fulfillmentType === "delivery" ? "Deliver to" : "Pickup at"}:{" "}
        <span className="font-semibold text-foreground">{fulfillmentDetail}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Total: <span className="font-bold text-primary">{formatCurrency(lastOrder.total)}</span>
      </p>
      <CustomerButton type="button" className="mt-4 w-full gap-2" onClick={onOrderAgain}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Repeat last order
      </CustomerButton>
    </div>
  );
}
