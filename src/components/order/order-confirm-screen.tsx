"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CustomerButton } from "@/components/customer/customer-button";
import { formatCurrency } from "@/lib/utils";
import { OrderFormInput } from "@/modules/orders/customer-order";
import { serviceLabel, type ServiceType } from "@/lib/orders/order-wizard";
import { cn } from "@/lib/utils";

export function OrderConfirmScreen({
  form,
  service,
  productLine,
  cartLines,
  totals,
  isIceInquiry,
  isSubmitting,
  error,
  onSubmit
}: {
  form: OrderFormInput;
  service: ServiceType | null;
  productLine: string;
  cartLines?: Array<{ name: string; detail: string; total: number }>;
  totals: { total: number; deliveryFee: number };
  isIceInquiry: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const fulfillmentLine =
    form.fulfillmentType === "delivery"
      ? `Delivery · ${form.deliverySlot ?? "next slot"}`
      : `Pickup · ${form.pickupLocation ?? "campus"}`;

  const hasAdvancedDetails = Boolean(
    form.customerNotes?.trim() ||
      form.promoCode?.trim() ||
      form.referredByPhone?.trim() ||
      form.brandingText?.trim() ||
      form.eventName?.trim() ||
      form.designNotes?.trim() ||
      form.artworkUrl?.trim() ||
      form.paymentMethod !== "cash" ||
      form.containerCount > 1 ||
      form.largeContainerCount > 0
  );

  return (
    <div className="customer-card border-cyan-100 p-5 shadow-none sm:p-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Confirm your order</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Quick review before you place it.</p>

      <dl className="mt-5 space-y-3 rounded-xl border border-cyan-100 bg-aqua/45 p-4 text-sm">
        {service ? (
          <div className="flex justify-between gap-3">
            <dt className="font-semibold text-muted-foreground">Service</dt>
            <dd className="text-right font-bold text-foreground">{serviceLabel(service)}</dd>
          </div>
        ) : null}
        {cartLines && cartLines.length > 0 ? (
          <div className="space-y-2">
            <dt className="font-semibold text-muted-foreground">Cart items</dt>
            {cartLines.map((line) => (
              <div key={`${line.name}-${line.detail}`} className="flex justify-between gap-3">
                <dd className="text-foreground">
                  <span className="font-bold">{line.name}</span>
                  <span className="block text-xs text-muted-foreground">{line.detail}</span>
                </dd>
                <dd className="font-bold text-foreground">{formatCurrency(line.total)}</dd>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-between gap-3">
            <dt className="font-semibold text-muted-foreground">Product</dt>
            <dd className="text-right font-bold text-foreground">{productLine}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="font-semibold text-muted-foreground">{form.fulfillmentType === "delivery" ? "Delivery" : "Pickup"}</dt>
          <dd className="text-right font-bold text-foreground">{fulfillmentLine}</dd>
        </div>
        {form.fulfillmentType === "delivery" && form.deliveryAddress ? (
          <div className="flex justify-between gap-3">
            <dt className="font-semibold text-muted-foreground">Deliver to</dt>
            <dd className="max-w-[60%] text-right font-bold text-foreground">{form.deliveryAddress}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="font-semibold text-muted-foreground">Phone</dt>
          <dd className="font-bold text-foreground">{form.phoneNumber}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-primary/20 bg-white p-4">
        <span className="text-base font-bold text-foreground">Total</span>
        {isIceInquiry ? (
          <span className="text-right text-sm font-bold text-primary">Contact for quote</span>
        ) : (
          <span className="text-2xl font-extrabold text-primary">{formatCurrency(totals.total)}</span>
        )}
      </div>
      {isIceInquiry ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Ice pricing is confirmed before delivery. Delivery fee may still apply (P{totals.deliveryFee}).
        </p>
      ) : null}

      {hasAdvancedDetails ? (
        <div className="mt-4 rounded-xl border border-cyan-100 bg-aqua/30">
          <button
            type="button"
            className="focus-ring flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-primary"
            onClick={() => setAdvancedOpen((current) => !current)}
            aria-expanded={advancedOpen}
          >
            Additional details
            <ChevronDown className={cn("h-4 w-4 transition", advancedOpen && "rotate-180")} />
          </button>
          {advancedOpen ? (
            <div className="space-y-2 border-t border-cyan-100 px-4 py-3 text-sm text-muted-foreground">
              {form.customerNotes ? <p>Notes: {form.customerNotes}</p> : null}
              {form.promoCode ? <p>Promo: {form.promoCode}</p> : null}
              {form.referredByPhone ? <p>Referred by: {form.referredByPhone}</p> : null}
              {form.paymentMethod !== "cash" ? <p>Payment: {form.paymentMethod.replaceAll("_", " ")}</p> : null}
              {form.brandingText ? <p>Branding: {form.brandingText}</p> : null}
              {form.eventName ? <p>Event: {form.eventName}</p> : null}
              {form.designNotes ? <p>Design notes: {form.designNotes}</p> : null}
              {form.artworkUrl ? <p>Artwork: {form.artworkUrl.split("/").pop() ?? "Attached"}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <CustomerButton type="button" className="mt-5 hidden w-full lg:inline-flex" disabled={isSubmitting} onClick={onSubmit}>
        {isSubmitting ? "Placing order..." : cartLines && cartLines.length > 1 ? "Place orders" : "Place Order"}
      </CustomerButton>
    </div>
  );
}
