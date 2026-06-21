"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { AdminNav } from "@/components/layout/admin-nav";
import { formatCurrency } from "@/lib/utils";
import type { PriceItem } from "@/modules/catalog/pricing";

export function MarketingDashboard() {
  const [products, setProducts] = useState<PriceItem[]>([]);

  useEffect(() => {
    fetch("/api/v1/catalog/products", { cache: "no-store" }).then((response) => response.json()).then((payload) => setProducts(payload.data ?? []));
  }, []);

  const refill = products.find((item) => item.sku === "FWM-REFILL-L")?.price ?? 1.6;
  const bottle500 = products.find((item) => item.sku === "FWM-BW-500")?.price ?? 5;
  const personalized500 = products.find((item) => item.sku === "FWM-PW-500-24")?.price ?? 144;
  const messages = [
    ["Student launch", `Fresh Water Market is live for students. Order bottled water, cases, and refills with pickup points around campus or student delivery from P30. 500ml bottles from ${formatCurrency(bottle500)}. Order: /order`],
    ["Refill reminder", `Bring your containers and refill with Fresh Water Market from ${formatCurrency(refill)} per litre. Pickup points: Vegas Parking Lot, UB Clinic Parking, 475 Parking Lot, Block 470 Parking Lot.`],
    ["Personalized bottles", `Make your event look sharp with Fresh Water Market personalized bottled water. 500ml x24 from ${formatCurrency(personalized500)}. Sticker design available. Request a quote: /corporate`],
    ["Corporate/event water", "Fresh Water Market supplies offices, conferences, launches, schools, churches, and activations across Gaborone. Bottled water, refills, branded labels, and delivery slots available."],
    ["Ice availability", "Ice is available from Fresh Water Market for events, res, and office coolers. Message us on WhatsApp to reserve stock before pickup or delivery."],
    ["Referral promotion", "Refer a friend to Fresh Water Market. When their completed order includes your phone number, you earn 5 loyalty points."]
  ];

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Launch marketing</h1>
        <div className="mt-5 grid gap-4">
          {messages.map(([title, body]) => (
            <article key={title} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold">{title}</h2>
                <button className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-bold text-primary hover:bg-slate-50" onClick={() => navigator.clipboard.writeText(body)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
