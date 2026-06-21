"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deliverySlots, pickupLocations } from "@/modules/catalog/pricing";
import type { PriceItem } from "@/modules/catalog/pricing";
import { paymentMethods, type OrderFormInput } from "@/modules/orders/customer-order";
import type { SlotAvailability } from "@/lib/orders/slot-availability";
import { getCaseProducts } from "@/lib/orders/order-wizard";
import { cn } from "@/lib/utils";

const inputClass = "focus-ring h-11 w-full rounded-xl border border-cyan-100 bg-white px-3 text-sm placeholder:text-primary/55";

export function AdvancedOptionsPanel({
  form,
  catalog,
  availability,
  promoMessage,
  promoApplied,
  forceOpen,
  hideContainerCount,
  onUpdate,
  onContainerCountChange,
  onValidatePromo
}: {
  form: OrderFormInput;
  catalog: PriceItem[];
  availability: SlotAvailability[];
  promoMessage: string | null;
  promoApplied: boolean;
  forceOpen?: boolean;
  hideContainerCount?: boolean;
  onUpdate: <K extends keyof OrderFormInput>(key: K, value: OrderFormInput[K]) => void;
  onContainerCountChange?: (count: number) => void;
  onValidatePromo: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const caseProducts = getCaseProducts(catalog);

  return (
    <div className="rounded-2xl border border-cyan-100 bg-aqua/30">
      <button
        type="button"
        className="focus-ring flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-bold text-primary"
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          Advanced options
          <span className="mt-0.5 block text-xs font-medium text-primary/65">Notes, promo, payment, slot override...</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", isOpen && "rotate-180")} />
      </button>
      {isOpen ? (
        <div className="grid gap-3 border-t px-4 py-4">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-primary/75">Customer notes</span>
            <textarea
              className="focus-ring min-h-20 w-full rounded-xl border border-cyan-100 bg-white p-3 text-sm placeholder:text-primary/55"
              value={form.customerNotes}
              onChange={(event) => onUpdate("customerNotes", event.target.value)}
              placeholder="Any special instructions"
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-primary/75">Promo code</span>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={form.promoCode ?? ""}
                  onChange={(event) => onUpdate("promoCode", event.target.value)}
                  placeholder="Promo code"
                />
                <Button type="button" variant="ghost" onClick={onValidatePromo}>
                  Apply
                </Button>
              </div>
              {promoMessage ? (
                <span className={`text-xs font-semibold ${promoApplied ? "text-emerald-700" : "text-red-700"}`}>{promoMessage}</span>
              ) : null}
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-primary/75">Referred by phone</span>
              <input
                className={inputClass}
                value={form.referredByPhone ?? ""}
                onChange={(event) => onUpdate("referredByPhone", event.target.value)}
                placeholder="Referrer phone"
              />
            </label>
          </div>

          {!hideContainerCount ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-primary/75">Container count</span>
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  value={form.containerCount}
                  onChange={(event) =>
                    onContainerCountChange
                      ? onContainerCountChange(Number(event.target.value))
                      : onUpdate("containerCount", Number(event.target.value))
                  }
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-primary/75">Large container count</span>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={form.largeContainerCount}
                  onChange={(event) => onUpdate("largeContainerCount", Number(event.target.value))}
                />
              </label>
            </div>
          ) : (
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-primary/75">Large container count</span>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.largeContainerCount}
                onChange={(event) => onUpdate("largeContainerCount", Number(event.target.value))}
              />
            </label>
          )}

          {caseProducts.length > 0 ? (
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-primary/75">Standard case override</span>
              <select
                className={inputClass}
                value={form.productSku}
                onChange={(event) => onUpdate("productSku", event.target.value)}
              >
                <option value={form.productSku}>Current selection</option>
                {caseProducts.map((product) => (
                  <option key={product.sku} value={product.sku}>
                    {product.name} - P{product.price}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-primary/75">Payment method</span>
            <select
              className={inputClass}
              value={form.paymentMethod}
              onChange={(event) => onUpdate("paymentMethod", event.target.value as OrderFormInput["paymentMethod"])}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            {form.fulfillmentType === "pickup" ? (
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-primary/75">Pickup location override</span>
                <select className={inputClass} value={form.pickupLocation} onChange={(event) => onUpdate("pickupLocation", event.target.value)}>
                  {pickupLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-primary/75">Delivery slot override</span>
                <select className={inputClass} value={form.deliverySlot} onChange={(event) => onUpdate("deliverySlot", event.target.value)}>
                  {deliverySlots.map((slot) => {
                    const slotAvailability = availability.find((availableSlot) => availableSlot.label === slot.label);
                    const disabled = Boolean(slotAvailability?.isFull || slotAvailability?.isPast);
                    return (
                      <option key={slot.id} value={slot.label} disabled={disabled}>
                        {slot.label}
                      </option>
                    );
                  })}
                </select>
              </label>
            )}
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-primary/75">Fulfillment date</span>
              <select
                className={inputClass}
                value={form.requestedFulfillmentDate}
                onChange={(event) => onUpdate("requestedFulfillmentDate", event.target.value)}
              >
                <option value={new Date().toISOString().slice(0, 10)}>Today</option>
                <option value={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}>Tomorrow</option>
              </select>
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
