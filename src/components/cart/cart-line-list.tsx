"use client";

import { formatCurrency } from "@/lib/utils";
import type { CartItemRecord } from "@/modules/customer/profile";
import { QuantityStepper } from "@/components/order/wizard/quantity-stepper";

function itemLineTotal(item: CartItemRecord) {
  if (item.serviceType === "refill") {
    return item.unitPrice * item.refillLitres;
  }
  return item.unitPrice * Math.max(item.quantity, 1);
}

export function CartLineList({
  items,
  onUpdateQuantity,
  onRemove,
  readOnly = false
}: {
  items: CartItemRecord[];
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  readOnly?: boolean;
}) {
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-600">Your cart is empty.</p>;
  }

  return (
    <div className="divide-y divide-slate-100 border-y border-slate-100">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-[#061a4f]">{item.productName}</p>
            <p className="mt-0.5 text-sm text-slate-500 capitalize">
              {item.serviceType === "refill" ? `${item.refillLitres}L refill · ${item.containerCount} container(s)` : `Qty ${item.quantity}`}
            </p>
            <p className="mt-1 text-sm font-bold text-[#061a4f]">{formatCurrency(itemLineTotal(item))}</p>
          </div>
          <div className="flex items-center gap-3">
            {!readOnly && item.serviceType !== "refill" ? (
              <QuantityStepper value={item.quantity} onChange={(qty) => onUpdateQuantity(item.id, qty)} min={1} max={99} />
            ) : null}
            {!readOnly ? (
              <button type="button" className="focus-ring text-sm font-semibold text-red-600 hover:underline" onClick={() => onRemove(item.id)}>
                Remove
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
