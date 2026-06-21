"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, ImageIcon, MessageCircle, Phone, Printer, ReceiptText, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/layout/admin-nav";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCurrency } from "@/lib/utils";
import { buildInvoiceSummary, CustomerOrder, CustomerOrderStatus, CustomerPaymentStatus, CustomerPaymentMethod, OrderStatusEvent, orderStatuses, paymentMethods, paymentStatuses, personalizedStages } from "@/modules/orders/customer-order";

const inputClass = "h-10 w-full rounded-md border bg-white px-3 text-sm focus-ring";

export function AdminOrderDetail({ id }: { id: string }) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [events, setEvents] = useState<OrderStatusEvent[]>([]);
  const [feedback, setFeedback] = useState<{ rating: number; comment?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentConfirmedMethod, setPaymentConfirmedMethod] = useState<CustomerPaymentMethod>("cash");
  const [runnerName, setRunnerName] = useState("");
  const [runnerPhone, setRunnerPhone] = useState("");

  async function loadOrder() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/customer-orders/${id}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load order");
      }

      setOrder(payload.data.order);
      setEvents(payload.data.events);
      setFeedback(payload.data.feedback);
      setNote(payload.data.order.internalNotes ?? "");
      setPaymentReference(payload.data.order.paymentReference ?? "");
      setAmountPaid(payload.data.order.amountPaid);
      setPaymentConfirmedMethod(payload.data.order.paymentConfirmedMethod ?? payload.data.order.paymentMethod);
      setRunnerName(payload.data.order.assignedRunnerName ?? "");
      setRunnerPhone(payload.data.order.assignedRunnerPhone ?? "");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load order");
    } finally {
      setIsLoading(false);
    }
  }

  async function patchOrder(payload: Record<string, unknown>) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/customer-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, changedBy: "admin" })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update order");
      }

      await loadOrder();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update order");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return <main className="water-canvas grid min-h-screen place-items-center px-4 text-sm font-semibold text-slate-600">Loading order...</main>;
  }

  if (error && !order) {
    return <main className="water-canvas grid min-h-screen place-items-center px-4 text-sm font-semibold text-red-700">{error}</main>;
  }

  if (!order) {
    return null;
  }

  const whatsappNumber = order.phoneNumber.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi ${order.customerName}, this is Fresh Water Market about order ${order.orderNumber}.`)}`;
  const paymentReminder = `Hi ${order.customerName}, Fresh Water Market payment reminder for order ${order.orderNumber}. Balance due: ${formatCurrency(order.balanceDue)}. Please send proof after payment.`;
  const receiptMessage = `Hi ${order.customerName}, thank you for choosing Fresh Water Market. Receipt for order ${order.orderNumber}: total ${formatCurrency(order.total)}, paid ${formatCurrency(order.amountPaid)}, balance ${formatCurrency(order.balanceDue)}. View: /order/${order.orderNumber}`;

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <Link className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" href="/admin/orders">
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Admin order detail</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950">{order.orderNumber}</h1>
                <p className="mt-1 text-sm text-slate-600">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={order.status === "completed" ? "good" : order.status === "cancelled" ? "critical" : "warn"}>{order.status.replaceAll("_", " ")}</StatusPill>
                <StatusPill tone={order.paymentStatus === "paid" ? "good" : order.paymentStatus === "partial" ? "warn" : "critical"}>{order.paymentStatus}</StatusPill>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info title="Customer" lines={[order.customerName, order.phoneNumber]} />
              <Info title="Fulfillment" lines={[order.fulfillmentType, order.fulfillmentType === "delivery" ? order.deliverySlot ?? "" : order.pickupLocation ?? "", order.deliveryAddress ?? ""]} />
              <Info title="Items" lines={[`${order.productName} x ${order.quantity}`, `Refill ${order.refillLitres}L`, `Containers: ${order.containerCount}`, `Large >5L: ${order.largeContainerCount}`]} />
              <Info title="Totals" lines={[`Total ${formatCurrency(order.total)}`, `Paid ${formatCurrency(order.amountPaid)}`, `Balance ${formatCurrency(order.balanceDue)}`]} />
              <Info title="Customer notes" lines={[order.customerNotes ?? "No customer notes"]} />
              {order.orderType === "personalized" ? (
                <div className="rounded-md border bg-slate-50 p-4">
                  <h2 className="text-sm font-bold text-slate-950">Personalized order</h2>
                  <div className="mt-2 space-y-1">
                    {[
                      `Stage: ${order.personalizedStage ?? "design_pending"}`,
                      `Sticker design: ${order.stickerDesignRequired ? "yes" : "no"}`,
                      order.brandingText ? `Branding: ${order.brandingText}` : "",
                      order.eventName ? `Event: ${order.eventName}` : "",
                      order.designNotes ? `Design notes: ${order.designNotes}` : "",
                      order.artworkUrl ? `Artwork: ${order.artworkUrl.split("/").pop() ?? "attached"}` : ""
                    ].filter(Boolean).map((line) => <p key={line} className="text-sm text-slate-700">{line}</p>)}
                  </div>
                  {order.artworkUrl ? (
                    <a
                      className="focus-ring mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      href={`/api/v1/customer-orders/${order.id}/artwork`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Open artwork
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90" href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp customer
              </a>
              <a className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50" href={`tel:${order.phoneNumber}`}>
                <Phone className="h-4 w-4" />
                Call customer
              </a>
              <Button type="button" variant="ghost" onClick={() => navigator.clipboard.writeText(`Hi ${order.customerName}, this is Fresh Water Market about order ${order.orderNumber}.`)}>
                <Copy className="h-4 w-4" />
                Copy WhatsApp message
              </Button>
              <a className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50" href={`/order/${order.orderNumber}`} target="_blank" rel="noreferrer">
                <Printer className="h-4 w-4" />
                Print invoice
              </a>
              <Button type="button" variant="ghost" onClick={() => navigator.clipboard.writeText(buildInvoiceSummary(order))}>
                <ReceiptText className="h-4 w-4" />
                Copy invoice summary
              </Button>
              <a className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(paymentReminder)}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                Payment reminder
              </a>
              <a className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(receiptMessage)}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                Receipt message
              </a>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <section className="rounded-md border bg-slate-50 p-4">
                <h2 className="text-base font-bold text-slate-950">Status</h2>
                <label className="mt-3 grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Order status</span>
                  <select className={inputClass} value={order.status} onChange={(event) => patchOrder({ status: event.target.value as CustomerOrderStatus, note: "Status updated from order detail" })} disabled={isSaving}>
                    {orderStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                  </select>
                </label>
              </section>

              <section className="rounded-md border bg-slate-50 p-4">
                <h2 className="text-base font-bold text-slate-950">Payment update</h2>
                <div className="mt-3 grid gap-3">
                  <select className={inputClass} value={order.paymentStatus} onChange={(event) => patchOrder({ paymentStatus: event.target.value as CustomerPaymentStatus, note: "Payment status updated" })} disabled={isSaving}>
                    {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <select className={inputClass} value={paymentConfirmedMethod} onChange={(event) => setPaymentConfirmedMethod(event.target.value as CustomerPaymentMethod)}>
                    {paymentMethods.map((method) => <option key={method} value={method}>{method.replaceAll("_", " ")}</option>)}
                  </select>
                  <input className={inputClass} value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} placeholder="Payment reference" />
                  <input className={inputClass} type="number" min="0" step="0.01" value={amountPaid} onChange={(event) => setAmountPaid(Number(event.target.value))} placeholder="Amount paid" />
                  <Button type="button" onClick={() => patchOrder({ paymentReference, paymentConfirmedMethod, amountPaid, paymentStatus: amountPaid >= order.total ? "paid" : amountPaid > 0 ? "partial" : "unpaid" })} disabled={isSaving}>
                    Save payment
                  </Button>
                </div>
              </section>

              <section className="rounded-md border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <UserRoundCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 className="text-base font-bold text-slate-950">Runner assignment</h2>
                </div>
                <div className="mt-3 grid gap-3">
                  <input className={inputClass} value={runnerName} onChange={(event) => setRunnerName(event.target.value)} placeholder="Runner name" />
                  <input className={inputClass} value={runnerPhone} onChange={(event) => setRunnerPhone(event.target.value)} placeholder="Runner phone" />
                  <Button type="button" onClick={() => patchOrder({ assignedRunnerName: runnerName, assignedRunnerPhone: runnerPhone })} disabled={isSaving}>
                    Assign runner
                  </Button>
                </div>
              </section>
              {order.orderType === "personalized" ? (
                <section className="rounded-md border bg-slate-50 p-4">
                  <h2 className="text-base font-bold text-slate-950">Personalized workflow</h2>
                  <select className={`${inputClass} mt-3`} value={order.personalizedStage ?? "design_pending"} onChange={(event) => patchOrder({ personalizedStage: event.target.value })}>
                    {personalizedStages.map((stage) => <option key={stage} value={stage}>{stage.replaceAll("_", " ")}</option>)}
                  </select>
                </section>
              ) : null}
            </div>

            <section className="mt-5 rounded-md border bg-slate-50 p-4">
              <h2 className="text-base font-bold text-slate-950">Internal staff notes</h2>
              <textarea className="mt-3 min-h-28 w-full rounded-md border bg-white p-3 text-sm focus-ring" value={note} onChange={(event) => setNote(event.target.value)} />
              <Button className="mt-3" type="button" onClick={() => patchOrder({ internalNotes: note, note: "Internal notes updated" })} disabled={isSaving}>
                Save notes
              </Button>
            </section>
            <section className="mt-5 rounded-md border bg-slate-50 p-4">
              <h2 className="text-base font-bold text-slate-950">Customer feedback</h2>
              {feedback ? (
                <p className="mt-2 text-sm text-slate-700">Rating {feedback.rating}/5{feedback.comment ? ` - ${feedback.comment}` : ""}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No feedback submitted yet.</p>
              )}
            </section>
          </section>

          <aside className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Status history</h2>
            <div className="mt-4 space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-slate-600">No history yet.</p>
              ) : events.map((event) => (
                <div key={event.id} className="rounded-md border bg-slate-50 p-3">
                  <p className="text-sm font-bold capitalize text-slate-950">{event.eventType}</p>
                  <p className="text-sm text-slate-700">{event.fromValue ? `${event.fromValue} -> ` : ""}{event.toValue ?? event.note}</p>
                  {event.note ? <p className="mt-1 text-sm text-slate-600">{event.note}</p> : null}
                  <p className="mt-1 text-xs text-slate-500">{event.changedBy ?? "system"} - {new Date(event.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Info({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-md border bg-slate-50 p-4">
      <h2 className="text-sm font-bold text-slate-950">{title}</h2>
      <div className="mt-2 space-y-1">
        {lines.filter(Boolean).map((line) => <p key={line} className="text-sm capitalize text-slate-700">{line}</p>)}
      </div>
    </div>
  );
}
