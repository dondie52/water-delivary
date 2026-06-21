"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { corporateStatuses } from "@/modules/growth/growth";

type Corporate = { id: string; companyName: string; contactPerson: string; phone: string; email: string; useCase: string; bottleSize: string; quantity: number; brandingRequired: boolean; notes: string; status: string };

export function CorporateDashboard() {
  const [items, setItems] = useState<Corporate[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/v1/corporate", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setItems(payload.data);
    else setError(payload.error ?? "Could not load corporate leads");
  }

  async function update(id: string, status: string) {
    await fetch(`/api/v1/corporate/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-950">Corporate leads</h1>
        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        <div className="mt-5 divide-y rounded-lg border bg-white shadow-sm">
          {items.length === 0 ? <p className="p-5 text-sm text-slate-600">No corporate leads yet.</p> : items.map((item) => {
            const message = `Hi ${item.contactPerson}, Fresh Water Market received your ${item.companyName} inquiry for ${item.quantity} ${item.bottleSize} bottles${item.brandingRequired ? " with branding" : ""}. Can we prepare a quote?`;
            return (
            <article key={item.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_180px_280px] lg:items-center">
              <div>
                <p className="font-bold text-slate-950">{item.companyName}</p>
                <p className="text-sm text-slate-600">{item.contactPerson} - {item.phone} - {item.email}</p>
                <p className="text-sm text-slate-600">{item.useCase} | {item.quantity} x {item.bottleSize} | Branding: {item.brandingRequired ? "yes" : "no"}</p>
              </div>
              <p className="text-sm font-bold capitalize">{item.status}</p>
              <div className="flex flex-wrap gap-2">
                <a className="focus-ring inline-flex h-10 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white" href={`https://wa.me/${item.phone.startsWith("267") ? item.phone : `267${item.phone}`}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                {corporateStatuses.map((status) => <Button key={status} type="button" variant="ghost" onClick={() => update(item.id, status)}>{status}</Button>)}
              </div>
            </article>
          );})}
        </div>
      </section>
    </main>
  );
}
