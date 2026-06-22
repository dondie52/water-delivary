"use client";

import { BrandImage } from "@/components/customer/brand-image";
import { CustomerButtonLink } from "@/components/customer/customer-button";
import { QuantityStepper } from "@/components/order/wizard/quantity-stepper";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { productImageForCartItem, SERVICE_LABELS } from "@/lib/catalog/product-image";
import { formatCurrency } from "@/lib/utils";
import type { CartItemRecord } from "@/modules/customer/profile";

const thumbClass = "h-20 w-20 shrink-0 rounded-xl object-cover";

function itemLineTotal(item: CartItemRecord) {
  if (item.serviceType === "refill") {
    return item.unitPrice * item.refillLitres;
  }
  return item.unitPrice * Math.max(item.quantity, 1);
}

function itemMeta(item: CartItemRecord) {
  if (item.serviceType === "refill") {
    return `${item.refillLitres}L refill · ${item.containerCount} container${item.containerCount === 1 ? "" : "s"}`;
  }
  return `Qty ${item.quantity}`;
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
    return (
      <div className="customer-card overflow-hidden p-0 text-center">
        <div className="relative aspect-[16/9] bg-aqua/40">
          <BrandImage
            src={BRAND_ASSETS.bottles}
            alt="Fresh Water Market products"
            className="h-full w-full object-cover"
            fallbackLabel="Fresh Water Market"
            width={480}
            height={270}
            sizes="(min-width: 640px) 640px, 100vw"
          />
        </div>
        <div className="space-y-4 p-6 sm:p-8">
          <div>
            <p className="text-lg font-bold text-foreground">Your cart is empty</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Browse refills, bottled water, branded bottles, and ice to get started.
            </p>
          </div>
          <CustomerButtonLink href="/order" className="w-full sm:w-auto">
            Browse products
          </CustomerButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-card divide-y divide-cyan-100 p-0">
      {items.map((item) => {
        const lineTotal = itemLineTotal(item);
        const showUnitPrice = item.serviceType !== "refill" && item.quantity > 1;

        return (
          <div key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <BrandImage
                src={productImageForCartItem(item)}
                alt={item.productName}
                className={thumbClass}
                fallbackLabel={item.productName}
                width={80}
                height={80}
                sizes="80px"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-foreground">{item.productName}</p>
                  <span className="inline-flex rounded-full bg-aqua/60 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-cyan-100">
                    {SERVICE_LABELS[item.serviceType]}
                  </span>
                </div>
                <p className="mt-1 text-sm capitalize text-muted-foreground">{itemMeta(item)}</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(lineTotal)}</p>
                  {showUnitPrice ? (
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} each</p>
                  ) : null}
                </div>
              </div>
            </div>

            {!readOnly ? (
              <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:flex-col sm:items-end sm:justify-center">
                {item.serviceType !== "refill" ? (
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(qty) => onUpdateQuantity(item.id, qty)}
                    min={1}
                    max={99}
                  />
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">Fixed qty</span>
                )}
                <button
                  type="button"
                  className="focus-ring inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 hover:text-red-800"
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
