"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Loader2 } from "lucide-react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButton } from "@/components/customer/customer-button";
import { BrandImage } from "@/components/customer/brand-image";

const inputClass = "focus-ring h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm";

export function CorporateForm() {
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    useCase: "",
    bottleSize: "500ml",
    quantity: 100,
    brandingRequired: false,
    notes: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) setError(payload.error ?? "Could not submit inquiry");
      else setMessage("Corporate inquiry received. Our sales team will follow up.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CustomerShell>
      <main className="pb-16">
        <section className="customer-section max-w-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-slate-950">Corporate &amp; event water</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Branded bottles for launches, weddings, sports days, and campus events.
          </p>

          <BrandImage
            src="/brand/personalized-bottles.jpg"
            alt="Personalized Fresh Water Market bottles"
            className="mt-6 aspect-[16/9] w-full rounded-3xl object-cover shadow-md"
            fallbackLabel="Personalized bottles"
          />

          <form className="customer-card mt-6 grid gap-4 shadow-md" onSubmit={submit}>
            <input className={inputClass} placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
            <input className={inputClass} placeholder="Contact person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <input className={inputClass} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <input className={inputClass} placeholder="Use case (event, office, wedding…)" value={form.useCase} onChange={(e) => setForm({ ...form, useCase: e.target.value })} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className={inputClass} placeholder="Bottle size" value={form.bottleSize} onChange={(e) => setForm({ ...form, bottleSize: e.target.value })} />
              <input className={inputClass} type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.brandingRequired} onChange={(e) => setForm({ ...form, brandingRequired: e.target.checked })} />
              Branding / sticker design required
            </label>
            <textarea
              className="focus-ring min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
              placeholder="Notes — logo, colours, delivery date…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p> : null}
            {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
            <CustomerButton type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Request quote"
              )}
            </CustomerButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/order?service=personalized" className="font-semibold text-primary hover:underline">
              Order personalized bottles
            </Link>
          </p>
        </section>
      </main>
    </CustomerShell>
  );
}
