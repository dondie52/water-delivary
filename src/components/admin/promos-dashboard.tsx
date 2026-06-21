"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import type { PromoCode } from "@/modules/orders/customer-order";

const inputClass = "h-10 w-full rounded-md border bg-white px-3 text-sm focus-ring";

export function PromosDashboard() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [form, setForm] = useState({ code: "", discountType: "fixed", value: 0, active: true, startsAt: "", endsAt: "", usageLimit: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/v1/promos", { cache: "no-store" });
    if (response.ok) setPromos((await response.json()).data);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/v1/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, usageLimit: form.usageLimit ? Number(form.usageLimit) : null })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Could not save promo");
      return;
    }
    setForm({ code: "", discountType: "fixed", value: 0, active: true, startsAt: "", endsAt: "", usageLimit: "" });
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Promo codes</h1>
        <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
          <form className="h-fit rounded-lg border bg-white p-4 shadow-sm" onSubmit={save}>
            <h2 className="text-lg font-bold">Create or update promo</h2>
            <div className="mt-4 grid gap-3">
              <input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" required />
              <select className={inputClass} value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="fixed">Fixed amount</option>
                <option value="percent">Percent</option>
              </select>
              <input className={inputClass} type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
              <input className={inputClass} type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
              <input className={inputClass} type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
              <input className={inputClass} type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Usage limit" />
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
              {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
              <Button>Save promo</Button>
            </div>
          </form>
          <div className="grid gap-3">
            {promos.map((promo) => (
              <article key={promo.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-black">{promo.code}</p><p className="text-sm text-slate-600">{promo.discountType} - {promo.value}</p></div>
                  <p className={`text-sm font-bold ${promo.active ? "text-emerald-700" : "text-slate-500"}`}>{promo.active ? "active" : "inactive"}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">Used {promo.usedCount}{promo.usageLimit == null ? "" : ` / ${promo.usageLimit}`}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
