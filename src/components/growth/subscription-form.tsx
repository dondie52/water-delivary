"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, Loader2 } from "lucide-react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButton } from "@/components/customer/customer-button";
import { deliverySlots } from "@/modules/orders/customer-order";

const inputClass = "focus-ring h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm";

export function SubscriptionForm() {
  const [form, setForm] = useState({
    phone: "",
    customerName: "",
    productPreference: "",
    frequency: "weekly",
    preferredSlot: deliverySlots[0].label,
    fulfillmentType: "delivery",
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
      const response = await fetch("/api/v1/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) setError(payload.error ?? "Could not submit request");
      else setMessage("Subscription request received. We will confirm with you shortly.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CustomerShell>
      <main className="pb-16">
        <section className="customer-section max-w-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarClock className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-slate-950">Recurring water delivery</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Set up weekly or monthly refills and bottled water on your schedule.
          </p>

          <form className="customer-card mt-6 grid gap-4 shadow-md" onSubmit={submit}>
            <input className={inputClass} placeholder="Your name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
            <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required inputMode="tel" />
            <input className={inputClass} placeholder="What do you usually order?" value={form.productPreference} onChange={(e) => setForm({ ...form, productPreference: e.target.value })} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                Frequency
                <select className={inputClass} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                Preferred slot
                <select className={inputClass} value={form.preferredSlot} onChange={(e) => setForm({ ...form, preferredSlot: e.target.value })}>
                  {deliverySlots.map((slot) => (
                    <option key={slot.id} value={slot.label}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Fulfillment
              <select className={inputClass} value={form.fulfillmentType} onChange={(e) => setForm({ ...form, fulfillmentType: e.target.value })}>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
              </select>
            </label>
            <textarea
              className="focus-ring min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
              placeholder="Notes — address, quantity, special requests…"
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
                "Submit request"
              )}
            </CustomerButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/order" className="font-semibold text-primary hover:underline">
              Place a one-time order
            </Link>
          </p>
        </section>
      </main>
    </CustomerShell>
  );
}
