"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { subscriptionStatuses } from "@/modules/growth/growth";

type Subscription = { id: string; phone: string; customerName: string; productPreference: string; frequency: string; preferredSlot: string; fulfillmentType: string; notes: string; status: string; createdAt: string };

export function SubscriptionsDashboard() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/v1/subscriptions", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setItems(payload.data);
    else setError(payload.error ?? "Could not load subscriptions");
  }

  async function update(id: string, status: string) {
    await fetch(`/api/v1/subscriptions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-950">Subscriptions</h1>
        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        <div className="mt-5 divide-y rounded-lg border bg-white shadow-sm">
          {items.length === 0 ? <p className="p-5 text-sm text-slate-600">No subscription requests yet.</p> : items.map((item) => (
            <article key={item.id} className="grid gap-3 p-4 md:grid-cols-[1fr_180px_220px] md:items-center">
              <div>
                <p className="font-bold text-slate-950">{item.customerName} - {item.phone}</p>
                <p className="text-sm text-slate-600">{item.productPreference} | {item.frequency} | {item.fulfillmentType} | {item.preferredSlot}</p>
                {item.notes ? <p className="text-sm text-slate-500">{item.notes}</p> : null}
              </div>
              <p className="text-sm font-bold capitalize">{item.status}</p>
              <div className="flex flex-wrap gap-2">
                {subscriptionStatuses.map((status) => <Button key={status} type="button" variant="ghost" onClick={() => update(item.id, status)}>{status}</Button>)}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
