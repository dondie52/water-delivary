"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { CustomerButton, CustomerButtonLink } from "@/components/customer/customer-button";
import { formatCurrency } from "@/lib/utils";
import { CustomerOrder, paymentMethods } from "@/modules/orders/customer-order";

export function CartOrderSuccessScreen({
  orders,
  onPlaceAnother
}: {
  orders: CustomerOrder[];
  onPlaceAnother: () => void;
}) {
  const total = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-lg place-items-center px-4 py-8">
      <div className="customer-card w-full">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-foreground">Orders received!</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"} placed. Combined total:{" "}
          <span className="font-bold text-primary">{formatCurrency(total)}</span>.
        </p>

        <ul className="mt-5 space-y-2 rounded-2xl border border-cyan-100 bg-aqua/35 p-4 text-sm">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-3">
              <span className="font-semibold text-foreground">{order.orderNumber}</span>
              <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-cyan-50 p-4">
          <p className="text-sm font-bold text-foreground">Payment options</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {paymentMethods.map((method) => (
              <li key={method} className="capitalize">
                {method.replaceAll("_", " ")}
              </li>
            ))}
          </ul>
        </div>

        {orders[0] ? (
          <div className="mt-5 rounded-2xl border border-cyan-100 bg-aqua/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-foreground">Latest order message</p>
              <button
                className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-xl px-2 py-1 text-xs font-bold text-primary hover:bg-white"
                type="button"
                onClick={() => navigator.clipboard.writeText(orders[0].whatsappMessage)}
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{orders[0].whatsappMessage}</pre>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3">
          <CustomerButton type="button" variant="outline" onClick={onPlaceAnother}>
            Place another order
          </CustomerButton>
          {orders.length === 1 ? (
            <CustomerButtonLink href={`/order/${orders[0].orderNumber}`} variant="secondary">
              View receipt
            </CustomerButtonLink>
          ) : (
            <CustomerButtonLink href="/track" variant="secondary">
              Track orders
            </CustomerButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
