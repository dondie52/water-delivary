"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { AdminNav } from "@/components/layout/admin-nav";
import { formatCurrency } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";
import { CustomerOrder, CustomerOrderStatus, CustomerPaymentStatus, orderStatuses, paymentStatuses } from "@/modules/orders/customer-order";
import { AdminTableSkeleton } from "@/components/skeletons/admin-skeletons";

const inputClass = "h-10 rounded-md border bg-white px-3 text-sm focus-ring";

function statusTone(status: CustomerOrderStatus) {
  if (status === "cancelled") return "critical" as const;
  if (status === "completed") return "good" as const;
  if (status === "pending") return "warn" as const;
  return "neutral" as const;
}

function paymentTone(status: CustomerPaymentStatus) {
  if (status === "paid") return "good" as const;
  if (status === "partial") return "warn" as const;
  return "critical" as const;
}

export function AdminOrdersDashboard() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerOrderStatus>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders() {
    setIsLoading(true);
    setError(null);

    try {
      const query = statusFilter === "all" ? "" : `?status=${statusFilter}`;
      const response = await fetch(`/api/v1/customer-orders${query}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load orders");
      }

      setOrders(payload.data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load orders");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateOrder(id: string, field: "status" | "paymentStatus", value: string) {
    setUpdatingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/v1/customer-orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ [field]: value })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update order");
      }

      setOrders((current) => current.map((order) => (order.id === id ? payload.data : order)));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update order");
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return orders;
    }

    return orders.filter((order) =>
      [order.orderNumber, order.customerName, order.phoneNumber, order.productName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [orders, search]);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-slate-950">Submitted Orders</h1>
            <p className="mt-1 text-sm text-slate-600">Track customer orders, fulfillment status, and payment collection.</p>
          </div>
          <Button type="button" onClick={loadOrders} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button type="button" variant="ghost" onClick={() => downloadCsv("fresh-water-orders.csv", filteredOrders.map((order) => ({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            phoneNumber: order.phoneNumber,
            product: order.productName,
            total: order.total,
            status: order.status,
            paymentStatus: order.paymentStatus,
            deliverySlot: order.deliverySlot,
            pickupLocation: order.pickupLocation
          })))}>
            Export CSV
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-4 grid gap-3 rounded-lg border bg-white p-3 shadow-sm md:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-2 rounded-md border bg-white px-3">
            <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, phone"
            />
          </label>
          <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
            <option value="all">All statuses</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="hidden grid-cols-[1.05fr_1fr_1fr_0.8fr_0.95fr_0.95fr] gap-3 border-b bg-slate-100 px-4 py-3 text-xs font-bold uppercase text-slate-600 lg:grid">
            <span>Order</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
            <span>Payment</span>
          </div>

          {isLoading ? (
            <AdminTableSkeleton rows={8} columns={6} />
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-sm font-semibold text-slate-600">No submitted orders found.</div>
          ) : (
            <div className="divide-y">
              {filteredOrders.map((order) => (
                <article key={order.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[1.05fr_1fr_1fr_0.8fr_0.95fr_0.95fr] lg:items-center">
                  <div>
                    <p className="font-bold text-slate-950">{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                    <Link className="mt-1 inline-flex text-xs font-bold text-primary hover:underline" href={`/admin/orders/${order.id}`}>
                      View detail
                    </Link>
                    <div className="mt-2 lg:hidden">
                      <StatusPill tone={statusTone(order.status)}>{order.status.replaceAll("_", " ")}</StatusPill>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.customerName}</p>
                    <p className="text-sm text-slate-600">{order.phoneNumber}</p>
                    <p className="text-xs text-slate-500">{order.fulfillmentType === "delivery" ? order.deliverySlot : order.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.productName} x {order.quantity}</p>
                    <p className="text-sm text-slate-600">Refill {order.refillLitres}L</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-primary">{formatCurrency(order.total)}</p>
                    <p className="text-xs capitalize text-slate-500">{order.paymentMethod.replaceAll("_", " ")}</p>
                  </div>
                  <div className="grid gap-2">
                    <StatusPill tone={statusTone(order.status)}>{order.status.replaceAll("_", " ")}</StatusPill>
                    <select
                      className={inputClass}
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(event) => updateOrder(order.id, "status", event.target.value)}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <StatusPill tone={paymentTone(order.paymentStatus)}>{order.paymentStatus}</StatusPill>
                    <select
                      className={inputClass}
                      value={order.paymentStatus}
                      disabled={updatingId === order.id}
                      onChange={(event) => updateOrder(order.id, "paymentStatus", event.target.value)}
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
