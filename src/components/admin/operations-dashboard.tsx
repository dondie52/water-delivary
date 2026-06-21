"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, CreditCard, PackageCheck, Route } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { AdminNav } from "@/components/layout/admin-nav";
import { formatCurrency } from "@/lib/utils";
import { CustomerOrder } from "@/modules/orders/customer-order";
import { summarizeDailyOperations } from "@/modules/orders/operations";

export function OperationsDashboardV2() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/v1/customer-orders", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load operations data");
        }

        setOrders(payload.data);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not load operations data");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  const summary = useMemo(() => summarizeDailyOperations(orders), [orders]);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Daily Operations</h1>
          <p className="mt-1 text-sm text-slate-600">Today’s orders, fulfillment pressure, and payment collection.</p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {isLoading ? <p className="rounded-lg border bg-white p-5 text-sm font-semibold text-slate-600">Loading operations...</p> : null}
        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}

        {!isLoading && !error ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric icon={PackageCheck} label="Today's orders" value={summary.todaysOrders.length.toString()} />
              <Metric icon={CreditCard} label="Need payment" value={summary.needingPayment.length.toString()} />
              <Metric icon={Route} label="Ready for delivery" value={summary.readyForDelivery.length.toString()} />
              <Metric icon={BarChart3} label="Revenue collected" value={formatCurrency(summary.revenueCollected)} />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <GroupCard title="Orders by delivery slot" groups={summary.byDeliverySlot} />
              <GroupCard title="Orders by pickup location" groups={summary.byPickupLocation} />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <OrderList title="Orders needing payment" orders={summary.needingPayment} />
              <OrderList title="Ready for delivery" orders={summary.readyForDelivery} />
              <OrderList title="Completed orders" orders={summary.completed} />
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function GroupCard({ title, groups }: { title: string; groups: Record<string, number> }) {
  const entries = Object.entries(groups);

  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-2">
        {entries.length === 0 ? <p className="text-sm text-slate-600">No orders yet.</p> : entries.map(([label, count]) => (
          <div key={label} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            <StatusPill>{count}</StatusPill>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrderList({ title, orders }: { title: string; orders: CustomerOrder[] }) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-2">
        {orders.length === 0 ? <p className="text-sm text-slate-600">Nothing here right now.</p> : orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-md border bg-slate-50 p-3 hover:border-primary">
            <p className="text-sm font-bold text-slate-950">{order.orderNumber}</p>
            <p className="text-sm text-slate-600">{order.customerName} - {formatCurrency(order.total)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
