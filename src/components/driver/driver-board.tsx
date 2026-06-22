"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MapPin, Phone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { CustomerOrder } from "@/modules/orders/customer-order";
import { DriverBoardSkeleton } from "@/components/skeletons/driver-skeletons";

export function DriverBoard() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/customer-orders", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load driver orders");
      }

      setOrders(payload.data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load driver orders");
    } finally {
      setIsLoading(false);
    }
  }

  async function markCompleted(order: CustomerOrder) {
    setUpdatingId(order.id);
    setError(null);

    try {
      const response = await fetch(`/api/v1/customer-orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          changedBy: "driver",
          note: "Marked completed from driver view"
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not complete order");
      }

      setOrders((current) => current.map((currentOrder) => currentOrder.id === order.id ? payload.data : currentOrder));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not complete order");
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const readyOrders = useMemo(() => orders.filter((order) => ["confirmed", "preparing", "out_for_delivery"].includes(order.status)), [orders]);
  const assignedOrders = readyOrders.filter((order) => order.assignedRunnerName || order.assignedRunnerPhone);
  const unassignedOrders = readyOrders.filter((order) => !order.assignedRunnerName && !order.assignedRunnerPhone);

  return (
    <main className="water-canvas min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950">Runner Board</h1>
              <p className="text-sm text-slate-600">{readyOrders.length} ready orders</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-lg px-4 py-4">
        {isLoading ? <DriverBoardSkeleton /> : null}
        {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        {!isLoading && readyOrders.length === 0 ? (
          <div className="rounded-lg border bg-white p-5 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold text-slate-950">No ready orders</h2>
            <p className="mt-1 text-sm text-slate-600">Confirmed delivery and pickup work will appear here.</p>
          </div>
        ) : null}

        <OrderGroup title="Assigned orders" orders={assignedOrders} updatingId={updatingId} onComplete={markCompleted} />
        <OrderGroup title="Unassigned ready orders" orders={unassignedOrders} updatingId={updatingId} onComplete={markCompleted} />
      </section>
    </main>
  );
}

function OrderGroup({ title, orders, updatingId, onComplete }: { title: string; orders: CustomerOrder[]; updatingId: string | null; onComplete: (order: CustomerOrder) => void }) {
  return (
    <section className="mb-5">
      <h2 className="mb-3 text-sm font-bold uppercase text-slate-600">{title}</h2>
      <div className="space-y-3">
        {orders.length === 0 ? <p className="rounded-lg border bg-white p-4 text-sm text-slate-600">No orders in this group.</p> : orders.map((order) => (
          <article key={order.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-950">{order.customerName}</p>
                <p className="text-xs text-slate-500">{order.orderNumber}</p>
              </div>
              <StatusPill tone={order.status === "out_for_delivery" ? "warn" : "neutral"}>{order.status.replaceAll("_", " ")}</StatusPill>
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <a className="flex items-center gap-2 font-semibold text-primary" href={`tel:${order.phoneNumber}`}>
                <Phone className="h-4 w-4" />
                {order.phoneNumber}
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                {order.fulfillmentType === "delivery" ? order.deliverySlot : order.pickupLocation}
              </p>
              <p>{order.productName} x {order.quantity} | Refill {order.refillLitres}L</p>
              {order.assignedRunnerName ? <p className="font-semibold text-slate-900">Runner: {order.assignedRunnerName} {order.assignedRunnerPhone ? `(${order.assignedRunnerPhone})` : ""}</p> : null}
            </div>
            <Button className="mt-4 h-11 w-full" type="button" onClick={() => onComplete(order)} disabled={updatingId === order.id}>
              {updatingId === order.id ? "Updating..." : "Mark delivered/completed"}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
