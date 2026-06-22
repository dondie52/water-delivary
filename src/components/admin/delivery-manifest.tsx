"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";
import { CustomerOrder, deliverySlots } from "@/modules/orders/customer-order";
import { AdminListSkeleton } from "@/components/skeletons/admin-skeletons";

const inputClass = "h-10 rounded-md border bg-white px-3 text-sm focus-ring";

export function DeliveryManifest() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/v1/customer-orders", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load manifest");
        }

        setOrders(payload.data);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not load manifest");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  const manifestOrders = useMemo(() => orders.filter((order) =>
    order.fulfillmentType === "delivery"
    && order.requestedFulfillmentDate === date
    && (slot === "all" || order.deliverySlot === slot)
  ), [orders, date, slot]);

  return (
    <main className="water-canvas min-h-screen">
      <div className="print:hidden"><AdminNav /></div>
      <header className="border-b bg-white print:border-0">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Printer className="h-8 w-8 text-primary print:hidden" aria-hidden="true" />
          <h1 className="mt-3 text-2xl font-bold text-slate-950 print:mt-0">Delivery Manifest</h1>
          <p className="mt-1 text-sm text-slate-600">Fresh Water Market delivery list for {date}{slot !== "all" ? `, ${slot}` : ""}</p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 grid gap-3 rounded-lg border bg-white p-3 shadow-sm print:hidden md:grid-cols-[180px_180px_auto]">
          <input className={inputClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <select className={inputClass} value={slot} onChange={(event) => setSlot(event.target.value)}>
            <option value="all">All slots</option>
            {deliverySlots.map((deliverySlot) => <option key={deliverySlot.id} value={deliverySlot.label}>{deliverySlot.label}</option>)}
          </select>
          <Button type="button" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print manifest
          </Button>
          <Button type="button" variant="ghost" onClick={() => downloadCsv("fresh-water-manifest.csv", manifestOrders.map((order) => ({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            phoneNumber: order.phoneNumber,
            location: order.deliveryAddress ?? order.deliverySlot,
            products: `${order.productName} x ${order.quantity}`,
            paymentStatus: order.paymentStatus,
            notes: order.internalNotes ?? order.customerNotes ?? ""
          })))}>
            Export CSV
          </Button>
        </div>

        {isLoading ? <AdminListSkeleton rows={6} /> : null}
        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        {!isLoading && manifestOrders.length === 0 ? <p className="rounded-lg border bg-white p-5 text-sm text-slate-600">No delivery orders match this manifest.</p> : null}

        <div className="overflow-hidden rounded-lg border bg-white shadow-sm print:shadow-none">
          {manifestOrders.map((order) => (
            <article key={order.id} className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-[1fr_1fr_1fr_130px]">
              <div>
                <p className="font-bold text-slate-950">{order.orderNumber}</p>
                <p className="text-sm text-slate-700">{order.customerName}</p>
                <p className="text-sm text-slate-700">{order.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{order.deliverySlot}</p>
                <p className="text-sm text-slate-700">{order.deliveryAddress}</p>
                <p className="text-sm text-slate-700">{order.assignedRunnerName ?? "Unassigned runner"}</p>
                <p className="text-sm text-slate-700">{order.assignedRunnerPhone ?? ""}</p>
              </div>
              <div>
                <p className="text-sm text-slate-700">{order.productName} x {order.quantity}</p>
                <p className="text-sm text-slate-700">Refill {order.refillLitres}L</p>
                {order.internalNotes ? <p className="text-xs text-slate-500">Notes: {order.internalNotes}</p> : null}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">{formatCurrency(order.total)}</p>
                <p className="text-sm capitalize text-slate-700">{order.paymentStatus}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
