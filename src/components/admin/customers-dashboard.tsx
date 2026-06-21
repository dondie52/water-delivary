"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { formatCurrency } from "@/lib/utils";
import { CustomerOrder } from "@/modules/orders/customer-order";

export function CustomersDashboard() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [points, setPoints] = useState<Array<{ phone_number: string; points: number }>>([]);

  useEffect(() => {
    async function load() {
      const ordersResponse = await fetch("/api/v1/customer-orders", { cache: "no-store" });
      const ordersPayload = await ordersResponse.json();
      if (ordersResponse.ok) setOrders(ordersPayload.data);
      const pointsResponse = await fetch("/api/v1/customer-points", { cache: "no-store" });
      if (pointsResponse.ok) setPoints((await pointsResponse.json()).data);
    }
    load();
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; totalOrders: number; totalSpent: number; lastOrder: string; points: number }>();
    for (const order of orders) {
      const current = map.get(order.phoneNumber) ?? { name: order.customerName, phone: order.phoneNumber, totalOrders: 0, totalSpent: 0, lastOrder: order.createdAt, points: 0 };
      current.totalOrders += 1;
      current.totalSpent += order.total;
      if (order.createdAt > current.lastOrder) current.lastOrder = order.createdAt;
      current.points = points.find((point) => point.phone_number === order.phoneNumber)?.points ?? 0;
      map.set(order.phoneNumber, current);
    }
    return [...map.values()].sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, points]);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-950">Customers</h1>
        <div className="mt-5 divide-y rounded-lg border bg-white shadow-sm">
          {customers.map((customer) => (
            <Link key={customer.phone} href={`/admin/customers/${customer.phone}`} className="grid gap-2 p-4 hover:bg-slate-50 md:grid-cols-[1fr_120px_140px_120px]">
              <div><p className="font-bold">{customer.name}</p><p className="text-sm text-slate-600">{customer.phone}</p></div>
              <p>{customer.totalOrders} orders</p>
              <p>{formatCurrency(customer.totalSpent)}</p>
              <p>{customer.points} pts</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
