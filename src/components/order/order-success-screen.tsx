"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { CustomerButton, CustomerButtonLink } from "@/components/customer/customer-button";
import { formatCurrency } from "@/lib/utils";
import { CustomerOrder, paymentMethods } from "@/modules/orders/customer-order";

export function OrderSuccessScreen({
  order,
  onPlaceAnother
}: {
  order: CustomerOrder;
  onPlaceAnother: () => void;
}) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-lg place-items-center px-4 py-8">
      <div className="customer-card w-full">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-950">Order received!</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Thank you. Your order number is{" "}
          <span className="font-bold text-slate-950">{order.orderNumber}</span>. Total:{" "}
          <span className="font-bold text-primary">{formatCurrency(order.total)}</span>.
        </p>

        <div className="mt-5 rounded-2xl bg-cyan-50 p-4">
          <p className="text-sm font-bold text-slate-900">Payment options</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {paymentMethods.map((method) => (
              <li key={method} className="capitalize">{method.replaceAll("_", " ")}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900">Order summary message</p>
            <button
              className="focus-ring inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-bold text-primary hover:bg-white"
              type="button"
              onClick={() => navigator.clipboard.writeText(order.whatsappMessage)}
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{order.whatsappMessage}</pre>
        </div>

        <div className="mt-5 grid gap-3">
          <CustomerButton type="button" variant="outline" onClick={onPlaceAnother}>
            Place another order
          </CustomerButton>
          <CustomerButtonLink href={`/order/${order.orderNumber}`} variant="secondary">
            View receipt
          </CustomerButtonLink>
        </div>
      </div>
    </section>
  );
}
