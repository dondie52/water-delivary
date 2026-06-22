"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { AdminNav } from "@/components/layout/admin-nav";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCurrency } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";
import { CustomerOrder, orderStatuses } from "@/modules/orders/customer-order";
import { AdminStatsSkeleton } from "@/components/skeletons/admin-skeletons";

export function ReportsDashboard() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [feedback, setFeedback] = useState<Array<{ rating: number; comment?: string; order_number: string }>>([]);
  const [subscriptions, setSubscriptions] = useState<Array<{ id: string }>>([]);
  const [corporate, setCorporate] = useState<Array<{ id: string }>>([]);
  const [points, setPoints] = useState<Array<{ phoneNumber?: string; phone_number?: string; points: number; referralCount?: number; referral_count?: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const [ordersResponse, feedbackResponse, subscriptionsResponse, corporateResponse, pointsResponse] = await Promise.all([
          fetch("/api/v1/customer-orders", { cache: "no-store" }),
          fetch("/api/v1/feedback", { cache: "no-store" }),
          fetch("/api/v1/subscriptions", { cache: "no-store" }),
          fetch("/api/v1/corporate", { cache: "no-store" }),
          fetch("/api/v1/customer-points", { cache: "no-store" })
        ]);
        const payload = await ordersResponse.json();

        if (!ordersResponse.ok) {
          throw new Error(payload.error ?? "Could not load reports");
        }

        setOrders(payload.data);
        if (feedbackResponse.ok) {
          const feedbackPayload = await feedbackResponse.json();
          setFeedback(feedbackPayload.data);
        }
        if (subscriptionsResponse.ok) setSubscriptions((await subscriptionsResponse.json()).data);
        if (corporateResponse.ok) setCorporate((await corporateResponse.json()).data);
        if (pointsResponse.ok) setPoints((await pointsResponse.json()).data);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not load reports");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  const report = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((order) => order.createdAt.slice(0, 10) === today);
    const statusCounts = Object.fromEntries(orderStatuses.map((status) => [status, orders.filter((order) => order.status === status).length]));
    const productCounts = orders.reduce<Record<string, number>>((counts, order) => {
      counts[order.productName] = (counts[order.productName] ?? 0) + order.quantity;
      return counts;
    }, {});
    const productRevenue = orders.reduce<Record<string, number>>((counts, order) => {
      counts[order.productName] = (counts[order.productName] ?? 0) + order.subtotal;
      return counts;
    }, {});
    const promoUsage = orders.reduce<Record<string, { count: number; discount: number }>>((counts, order) => {
      if (!order.promoCode) return counts;
      const current = counts[order.promoCode] ?? { count: 0, discount: 0 };
      current.count += 1;
      current.discount += order.discountAmount;
      counts[order.promoCode] = current;
      return counts;
    }, {});
    const acquisitionByDay = orders.reduce<Record<string, Set<string>>>((days, order) => {
      const day = order.createdAt.slice(0, 10);
      days[day] = days[day] ?? new Set<string>();
      days[day].add(order.phoneNumber);
      return days;
    }, {});
    const customerGroups = orders.reduce<Record<string, { name: string; phone: string; orders: number; spent: number }>>((groups, order) => {
      const current = groups[order.phoneNumber] ?? { name: order.customerName, phone: order.phoneNumber, orders: 0, spent: 0 };
      current.orders += 1;
      current.spent += order.total;
      groups[order.phoneNumber] = current;
      return groups;
    }, {});
    const customers = Object.values(customerGroups);

    return {
      dailyRevenue: todayOrders.reduce((sum, order) => sum + order.amountPaid, 0),
      grossRevenue: orders.reduce((sum, order) => sum + order.total + order.discountAmount, 0),
      netRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalDiscounts: orders.reduce((sum, order) => sum + order.discountAmount, 0),
      statusCounts,
      topProducts: Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      productRevenue: Object.entries(productRevenue).sort((a, b) => b[1] - a[1]).slice(0, 6),
      promoUsage: Object.entries(promoUsage).sort((a, b) => b[1].count - a[1].count),
      acquisitionByDay: Object.entries(acquisitionByDay).map(([day, phones]) => [day, phones.size] as const).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7),
      deliveryFeeRevenue: orders.reduce((sum, order) => sum + order.deliveryFee, 0),
      unpaidOrders: orders.filter((order) => order.paymentStatus !== "paid"),
      completedOrders: orders.filter((order) => order.status === "completed"),
      averageRating: feedback.length > 0 ? feedback.reduce((sum, item) => sum + Number(item.rating), 0) / feedback.length : 0,
      repeatCustomerCount: customers.filter((customer) => customer.orders > 1).length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      topCustomers: customers.sort((a, b) => b.spent - a.spent).slice(0, 5),
      loyaltyPointsIssued: points.reduce((sum, item) => sum + Number(item.points ?? 0), 0),
      referralOrders: orders.filter((order) => Boolean(order.referredByPhone)).length,
      subscriptionRequests: subscriptions.length,
      corporateLeads: corporate.length
    };
  }, [orders, feedback, subscriptions, corporate, points]);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <BarChart3 className="h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="mt-3 text-2xl font-bold text-slate-950">Reports</h1>
          <p className="mt-1 text-sm text-slate-600">Simple pilot launch reporting for sales and operations.</p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {isLoading ? <AdminStatsSkeleton count={6} /> : null}
        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        {!isLoading && !error ? (
          <div className="grid gap-5">
            <div className="flex justify-end">
              <button
                className="focus-ring h-10 rounded-md border bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                type="button"
                onClick={() => downloadCsv("fresh-water-reports.csv", [
                  { metric: "dailyRevenue", value: report.dailyRevenue },
                  { metric: "grossRevenue", value: report.grossRevenue },
                  { metric: "netRevenue", value: report.netRevenue },
                  { metric: "totalDiscounts", value: report.totalDiscounts },
                  { metric: "deliveryFeeRevenue", value: report.deliveryFeeRevenue },
                  { metric: "unpaidOrders", value: report.unpaidOrders.length },
                  { metric: "completedOrders", value: report.completedOrders.length },
                  { metric: "repeatCustomerCount", value: report.repeatCustomerCount },
                  { metric: "averageOrderValue", value: report.averageOrderValue },
                  { metric: "loyaltyPointsIssued", value: report.loyaltyPointsIssued },
                  { metric: "referralOrders", value: report.referralOrders },
                  { metric: "subscriptionRequests", value: report.subscriptionRequests },
                  { metric: "corporateLeads", value: report.corporateLeads },
                  { metric: "feedbackAverageRating", value: report.averageRating }
                ])}
              >
                Export CSV
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Daily revenue" value={formatCurrency(report.dailyRevenue)} />
              <Metric label="Gross revenue" value={formatCurrency(report.grossRevenue)} />
              <Metric label="Discounts given" value={formatCurrency(report.totalDiscounts)} />
              <Metric label="Net revenue" value={formatCurrency(report.netRevenue)} />
              <Metric label="Delivery fee revenue" value={formatCurrency(report.deliveryFeeRevenue)} />
              <Metric label="Unpaid orders" value={report.unpaidOrders.length.toString()} />
              <Metric label="Completed orders" value={report.completedOrders.length.toString()} />
              <Metric label="Feedback avg" value={report.averageRating ? `${report.averageRating.toFixed(1)}/5` : "No ratings"} />
              <Metric label="Repeat customers" value={report.repeatCustomerCount.toString()} />
              <Metric label="Average order value" value={formatCurrency(report.averageOrderValue)} />
              <Metric label="Loyalty points issued" value={report.loyaltyPointsIssued.toString()} />
              <Metric label="Referral orders" value={report.referralOrders.toString()} />
              <Metric label="Subscription requests" value={report.subscriptionRequests.toString()} />
              <Metric label="Corporate leads" value={report.corporateLeads.toString()} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Orders by status">
                {Object.entries(report.statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-800">{status.replaceAll("_", " ")}</span>
                    <StatusPill>{count}</StatusPill>
                  </div>
                ))}
              </Card>
              <Card title="Top products">
                {report.topProducts.length === 0 ? <p className="text-sm text-slate-600">No product data yet.</p> : report.topProducts.map(([product, count]) => (
                  <div key={product} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-800">{product}</span>
                    <StatusPill>{count}</StatusPill>
                  </div>
                ))}
              </Card>
              <Card title="Product revenue">
                {report.productRevenue.length === 0 ? <p className="text-sm text-slate-600">No revenue data yet.</p> : report.productRevenue.map(([product, revenue]) => (
                  <div key={product} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-800">{product}</span>
                    <StatusPill>{formatCurrency(revenue)}</StatusPill>
                  </div>
                ))}
              </Card>
              <Card title="Promo usage">
                {report.promoUsage.length === 0 ? <p className="text-sm text-slate-600">No promo usage yet.</p> : report.promoUsage.map(([code, usage]) => (
                  <div key={code} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-800">{code}</span>
                    <StatusPill>{usage.count} uses - {formatCurrency(usage.discount)}</StatusPill>
                  </div>
                ))}
              </Card>
              <Card title="Customer acquisition by day">
                {report.acquisitionByDay.length === 0 ? <p className="text-sm text-slate-600">No acquisition data yet.</p> : report.acquisitionByDay.map(([day, count]) => (
                  <div key={day} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-800">{day}</span>
                    <StatusPill>{count} customers</StatusPill>
                  </div>
                ))}
              </Card>
              <Card title="Recent feedback">
                {feedback.length === 0 ? <p className="text-sm text-slate-600">No feedback yet.</p> : feedback.slice(0, 6).map((item) => (
                  <div key={item.order_number} className="rounded-md border bg-slate-50 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-800">{item.order_number}: {item.rating}/5</p>
                    {item.comment ? <p className="text-sm text-slate-600">{item.comment}</p> : null}
                  </div>
                ))}
              </Card>
              <Card title="Top customers">
                {report.topCustomers.length === 0 ? <p className="text-sm text-slate-600">No customer data yet.</p> : report.topCustomers.map((customer) => (
                  <div key={customer.phone} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-800">{customer.name}</span>
                    <StatusPill>{formatCurrency(customer.spent)}</StatusPill>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}
