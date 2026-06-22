"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { CustomerOrder } from "@/modules/orders/customer-order";
import { formatCurrency } from "@/lib/utils";
import { AdminCustomerDetailSkeleton } from "@/components/skeletons/admin-skeletons";

export function CustomerDetail({ phone }: { phone: string }) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [feedback, setFeedback] = useState<Array<{ order_number: string; rating: number; comment?: string }>>([]);
  const [subscriptions, setSubscriptions] = useState<Array<{ id: string; productPreference: string; status: string }>>([]);
  const [notes, setNotes] = useState<Array<{ id: string; note: string; staff_name?: string; created_at: string }>>([]);
  const [points, setPoints] = useState<Array<{ phoneNumber?: string; phone_number?: string; points: number; referralCount?: number; referral_count?: number }>>([]);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async function load() {
    setIsLoading(true);
    try {
      const [ordersResponse, feedbackResponse, subscriptionsResponse, notesResponse, pointsResponse] = await Promise.all([
      fetch(`/api/v1/customer-orders?phone=${encodeURIComponent(phone)}`, { cache: "no-store" }),
      fetch("/api/v1/feedback", { cache: "no-store" }),
      fetch("/api/v1/subscriptions", { cache: "no-store" }),
      fetch(`/api/v1/customer-notes?phone=${encodeURIComponent(phone)}`, { cache: "no-store" }),
      fetch("/api/v1/customer-points", { cache: "no-store" })
    ]);
    let loadedOrders: CustomerOrder[] = [];
    if (ordersResponse.ok) {
      loadedOrders = (await ordersResponse.json()).data;
      setOrders(loadedOrders);
    }
    if (feedbackResponse.ok) setFeedback((await feedbackResponse.json()).data.filter((item: { order_number: string }) => loadedOrders.some((order) => order.orderNumber === item.order_number)));
    if (subscriptionsResponse.ok) setSubscriptions((await subscriptionsResponse.json()).data.filter((item: { phone: string }) => item.phone === phone));
    if (notesResponse.ok) setNotes((await notesResponse.json()).data);
    if (pointsResponse.ok) setPoints((await pointsResponse.json()).data.filter((item: { phoneNumber?: string; phone_number?: string }) => (item.phoneNumber ?? item.phone_number) === phone));
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  async function saveNote() {
    await fetch("/api/v1/customer-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneNumber: phone, note }) });
    setNote("");
    await load();
  }

  useEffect(() => { load(); }, [load]);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Customer {phone}</h1>
        {isLoading ? (
          <AdminCustomerDetailSkeleton />
        ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card title="Order history">{orders.map((order) => <p key={order.id} className="text-sm">{order.orderNumber} - {formatCurrency(order.total)} - {order.status}</p>)}</Card>
          <Card title="Feedback">{feedback.length === 0 ? <p className="text-sm">No feedback.</p> : feedback.map((item) => <p key={item.order_number} className="text-sm">{item.order_number}: {item.rating}/5 {item.comment}</p>)}</Card>
          <Card title="Subscriptions">{subscriptions.length === 0 ? <p className="text-sm">No subscription requests.</p> : subscriptions.map((item) => <p key={item.id} className="text-sm">{item.productPreference} - {item.status}</p>)}</Card>
          <Card title="Referral tracking">{points.length === 0 ? <p className="text-sm">No referral points yet.</p> : points.map((item) => <p key={item.phoneNumber ?? item.phone_number} className="text-sm">Points: {item.points} - Referrals: {item.referralCount ?? item.referral_count ?? 0}</p>)}</Card>
          <Card title="Notes">
            <textarea className="min-h-24 w-full rounded-md border p-3 text-sm" value={note} onChange={(event) => setNote(event.target.value)} />
            <Button className="mt-2" onClick={saveNote}>Save note</Button>
            <div className="mt-3 space-y-2">{notes.map((item) => <p key={item.id} className="text-sm">{item.note} <span className="text-slate-500">{item.staff_name}</span></p>)}</div>
          </Card>
        </div>
        )}
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="mb-3 text-lg font-bold">{title}</h2>{children}</section>;
}
