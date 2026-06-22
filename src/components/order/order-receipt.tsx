"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Printer, RotateCcw } from "lucide-react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButtonLink } from "@/components/customer/customer-button";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { OrderStatusStepper } from "@/components/order/order-status-stepper";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCurrency } from "@/lib/utils";
import { buildInvoiceSummary, buildWhatsappTemplate, CustomerOrder, OrderStatusEvent, whatsappTemplateTypes } from "@/modules/orders/customer-order";
import { cn } from "@/lib/utils";
import { ReceiptSkeleton } from "@/components/skeletons/customer-skeletons";

export function OrderReceipt({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [events, setEvents] = useState<OrderStatusEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/customer-orders/by-number/${encodeURIComponent(orderNumber)}`, { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load receipt");
        }

        setOrder(payload.data.order);
        setEvents(payload.data.events);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not load receipt");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderNumber]);

  if (isLoading) {
    return <ReceiptSkeleton />;
  }

  if (error || !order) {
    return (
      <CustomerShell>
        <main className="grid min-h-[50vh] place-items-center px-4">
          <div className="customer-card max-w-md text-center">
            <h1 className="text-xl font-bold text-foreground">Receipt not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error ?? "We could not find this order."}</p>
            <Link className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline" href="/order">
              Place a new order
            </Link>
          </div>
        </main>
      </CustomerShell>
    );
  }

  const fulfillmentLine = order.fulfillmentType === "delivery"
    ? `${order.deliverySlot}${order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}`
    : order.pickupLocation;

  return (
    <CustomerShell>
      <main className="bg-gradient-to-b from-cyan-50/40 to-white">
        <section className="customer-section max-w-lg">
          <div className="customer-card text-center">
            <BrandImage
              src={BRAND_ASSETS.logo}
              alt="Fresh Water Market"
              fit="contain"
              className="mx-auto h-12 w-auto rounded-xl"
              fallbackLabel="Fresh Water Market"
              width={206}
              height={206}
            />
            <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-foreground">Thank you!</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your Fresh Water Market order is on its way.</p>
            <p className="mt-4 text-lg font-bold text-primary">{order.orderNumber}</p>
            <div className="mt-5">
              <OrderStatusStepper status={order.status} />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <StatusPill tone={order.status === "completed" ? "good" : order.status === "cancelled" ? "critical" : "warn"}>
                {order.status.replaceAll("_", " ")}
              </StatusPill>
              <StatusPill tone={order.paymentStatus === "paid" ? "good" : order.paymentStatus === "partial" ? "warn" : "critical"}>
                {order.paymentStatus}
              </StatusPill>
            </div>
          </div>

          <div className="customer-card mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-black text-primary">{formatCurrency(order.total)}</span>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-muted-foreground">{order.fulfillmentType === "delivery" ? "Delivery" : "Pickup"}</p>
              <p className="mt-1 font-bold text-foreground">{fulfillmentLine}</p>
            </div>
            <div className="border-t pt-4 text-sm">
              <p className="font-semibold text-foreground">{order.productName}</p>
              {order.quantity > 0 ? <p className="text-muted-foreground">Qty: {order.quantity}</p> : null}
              {order.refillLitres > 0 ? <p className="text-muted-foreground">Refill: {order.refillLitres}L</p> : null}
              {order.deliveryFee > 0 ? <p className="text-muted-foreground">Delivery: {formatCurrency(order.deliveryFee)}</p> : null}
              {order.discountAmount > 0 ? <p className="text-emerald-700">Discount: -{formatCurrency(order.discountAmount)}</p> : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 print:hidden">
            <button
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-white text-sm font-bold text-primary hover:bg-cyan-50"
              type="button"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print receipt
            </button>
            <CustomerButtonLink href={`/order?reorder=${order.orderNumber}`} variant="secondary" className="w-full">
              <RotateCcw className="h-4 w-4" />
              Reorder
            </CustomerButtonLink>
          </div>

          <div className="customer-card mt-4 print:hidden">
            <button
              type="button"
              className="focus-ring flex w-full items-center justify-between text-sm font-bold text-foreground"
              onClick={() => setDetailsOpen((current) => !current)}
            >
              Order details
              <ChevronDown className={cn("h-4 w-4 transition", detailsOpen && "rotate-180")} />
            </button>
            {detailsOpen ? (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  <p>{order.customerName} · {order.phoneNumber}</p>
                  <p className="mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                  <p className="mt-1">Paid: {formatCurrency(order.amountPaid)} · Balance: {formatCurrency(order.balanceDue)}</p>
                </div>
                {events.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-foreground">Status history</p>
                    {events.map((event) => (
                      <div key={event.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                        <p className="font-semibold capitalize">{event.eventType}</p>
                        <p className="text-muted-foreground">{event.fromValue ? `${event.fromValue} → ` : ""}{event.toValue ?? event.note}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <details className="text-sm">
                  <summary className="cursor-pointer font-bold text-foreground">Copy invoice text</summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs">{buildInvoiceSummary(order)}</pre>
                </details>
                <details className="text-sm">
                  <summary className="cursor-pointer font-bold text-foreground">WhatsApp templates</summary>
                  <div className="mt-2 space-y-2">
                    {whatsappTemplateTypes.map((type) => (
                      <div key={type} className="rounded-xl bg-slate-50 p-3">
                        <p className="font-semibold capitalize">{type.replaceAll("_", " ")}</p>
                        <p className="mt-1 text-muted-foreground">{buildWhatsappTemplate(type, order)}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </CustomerShell>
  );
}
