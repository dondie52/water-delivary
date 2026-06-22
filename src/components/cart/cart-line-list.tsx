"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { CustomerButtonLink } from "@/components/customer/customer-button";
import { QuantityStepper } from "@/components/order/wizard/quantity-stepper";
import { productImageForCartItem, SERVICE_LABELS } from "@/lib/catalog/product-image";
import { SERVICE_CARDS } from "@/lib/orders/service-cards";
import { formatCurrency } from "@/lib/utils";
import type { CartItemRecord } from "@/modules/customer/profile";

const thumbWrapClass =
  "relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-cyan-50 ring-1 ring-cyan-100 sm:h-24 sm:w-24";
const thumbClass = "h-full w-full object-contain p-1.5";

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
      <div className="customer-card p-6 sm:p-8">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">Your cart is empty</p>
          <p className="mx-auto mt-2 max-w-[36ch] text-sm leading-6 text-muted-foreground">
            Pick a service to add your first item, or browse the full catalog.
          </p>
        </div>

        <ul className="mt-6 space-y-2" aria-label="Start ordering">
          {SERVICE_CARDS.map((card) => {
            const Icon = card.icon;

            return (
              <li key={card.type}>
                <Link
                  href={`/order?service=${card.type}`}
                  className="focus-ring group flex min-h-11 items-center gap-3 rounded-xl border border-cyan-100 bg-aqua/30 px-4 py-3 transition-colors hover:border-primary/20 hover:bg-white"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-primary ring-1 ring-cyan-100">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-bold text-foreground">{card.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{card.body}</span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <CustomerButtonLink href="/order" className="mt-6 w-full">
          Browse all products
        </CustomerButtonLink>
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
              <div className={thumbWrapClass}>
                <BrandImage
                  src={productImageForCartItem(item)}
                  alt={item.productName}
                  className={thumbClass}
                  fallbackLabel={item.productName}
                  width={112}
                  height={112}
                  sizes="112px"
                  fit="contain"
                />
              </div>
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
