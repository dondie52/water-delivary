"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, PackageSearch } from "lucide-react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButton, CustomerButtonLink } from "@/components/customer/customer-button";
import { StatusPill } from "@/components/ui/status-pill";

type TrackedOrder = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentDate: string;
  slot?: string;
};

const inputClass = "focus-ring h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base shadow-sm";

export function TrackOrders() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setOrders([]);
    setHasSearched(true);

    try {
      const trimmed = query.trim();
      const key = trimmed.toUpperCase().startsWith("FWM-") ? "orderNumber" : "phone";
      const response = await fetch(`/api/v1/customer-orders/lookup?${key}=${encodeURIComponent(trimmed)}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error ?? "Could not find orders");
      setOrders(payload.data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not find orders");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CustomerShell>
      <main className="pb-16">
        <section className="customer-section max-w-lg">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <PackageSearch className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">Track your order</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Enter your phone number or order number (FWM-…).</p>

          <form className="customer-card mt-6 space-y-3 shadow-md" onSubmit={search}>
            <input
              className={inputClass}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="FWM-20260620-ABCDE or 75 909 515"
              required
            />
            <CustomerButton type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </span>
              ) : (
                "Track order"
              )}
            </CustomerButton>
          </form>

          {error ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
          ) : null}

          {isLoading ? (
            <div className="mt-6 grid gap-4">
              {[0, 1].map((key) => (
                <div key={key} className="customer-card animate-pulse space-y-3">
                  <div className="h-5 w-40 rounded-lg bg-slate-100" />
                  <div className="h-4 w-24 rounded-lg bg-slate-100" />
                  <div className="h-10 w-full rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {orders.map((order) => (
                <article key={order.orderNumber} className="customer-card shadow-md transition hover:shadow-lg">
                  <h2 className="text-lg font-bold text-slate-950">{order.orderNumber}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill>{order.status.replaceAll("_", " ")}</StatusPill>
                    <StatusPill tone={order.paymentStatus === "paid" ? "good" : "warn"}>{order.paymentStatus}</StatusPill>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">Fulfillment: {order.fulfillmentDate}</p>
                  {order.slot ? <p className="text-sm text-slate-600">Slot: {order.slot}</p> : null}
                  <CustomerButtonLink href={`/order/${order.orderNumber}`} className="mt-4 w-full" variant="outline">
                    View receipt
                  </CustomerButtonLink>
                </article>
              ))}
              {hasSearched && orders.length === 0 && !error ? (
                <div className="customer-card py-10 text-center">
                  <PackageSearch className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">No matching orders found</p>
                  <p className="mt-1 text-sm text-slate-500">Double-check your phone or order number.</p>
                </div>
              ) : null}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/order" className="font-semibold text-primary hover:underline">
              Place a new order
            </Link>
            {" · "}
            <Link href="/assistant" className="font-semibold text-primary hover:underline">
              Ask the assistant
            </Link>
          </p>
        </section>
      </main>
    </CustomerShell>
  );
}
