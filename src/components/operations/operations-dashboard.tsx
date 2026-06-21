import { ArrowUpRight, CalendarClock, CheckCircle2, ClipboardList, MapPin, Package, Route, Send, Truck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { commandQueues, executiveKpis, operatingModules } from "@/config/operating-system";
import { deliverySlots, pickupLocations, priceBook } from "@/modules/catalog/pricing";

function priorityTone(priority: string) {
  if (priority === "high") return "critical" as const;
  if (priority === "medium") return "warn" as const;
  return "good" as const;
}

export function OperationsDashboard() {
  const featuredPrices = priceBook.slice(0, 8);

  return (
    <AppShell>
      <AdminNav />
      <section className="water-tint border-b border-cyan-100/70">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.45fr_0.8fr] lg:px-8">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusPill tone="good">Gaborone Central live</StatusPill>
              <StatusPill tone="neutral">BWP price book</StatusPill>
              <StatusPill tone="warn">9 inventory actions</StatusPill>
            </div>
            <h2 className="max-w-4xl text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
              Command center for water retail, refill, branded production, and delivery growth.
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              Built around the workflows that make money: fast ordering, disciplined dispatch, inventory control, corporate account retention, and repeat purchase automation.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button>
                <ClipboardList className="h-4 w-4" />
                Create Order
              </Button>
              <Button variant="secondary">
                <Route className="h-4 w-4" />
                Dispatch Board
              </Button>
              <Button variant="ghost">
                <Send className="h-4 w-4" />
                Launch Campaign
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {executiveKpis.map((kpi) => (
              <div key={kpi.label} className="rounded-md border bg-card p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{kpi.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-5">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold">Operating Modules</h3>
              <Button variant="ghost">
                View Roadmap
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {operatingModules.map((module) => {
                const Icon = module.icon;
                return (
                  <article key={module.name} className="rounded-md border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <StatusPill tone={module.status === "Action needed" ? "critical" : module.status === "Review" ? "warn" : "neutral"}>
                        {module.status}
                      </StatusPill>
                    </div>
                    <h4 className="mt-4 text-base font-bold">{module.name}</h4>
                    <p className="mt-2 text-3xl font-bold">{module.metric}</p>
                    <p className="mt-1 min-h-10 text-sm leading-5 text-muted-foreground">{module.signal}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <section className="rounded-md border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Catalog and Pricing</h3>
                <Package className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                {featuredPrices.map((item) => (
                  <div key={item.sku} className="grid grid-cols-[1fr_auto] gap-3 rounded-sm border bg-white px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.unit} / {item.category.replaceAll("_", " ")}</p>
                    </div>
                    <p className="text-sm font-bold">P{item.price}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Fulfillment Network</h3>
                <Truck className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm font-bold">Delivery Slots</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {deliverySlots.map((slot) => (
                      <div key={slot.id} className="rounded-sm border bg-white p-2 text-center">
                        <p className="text-sm font-bold">{slot.label}</p>
                        <p className="text-xs text-muted-foreground">{slot.capacity} stops</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm font-bold">Pickup Locations</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {pickupLocations.map((location) => (
                      <div key={location} className="flex items-center gap-2 rounded-sm border bg-white px-3 py-2 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                        <span className="min-w-0 truncate">{location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-md border bg-card p-5">
            <h3 className="text-lg font-bold">Command Queue</h3>
            <div className="mt-4 space-y-3">
              {commandQueues.map((item) => (
                <div key={item.label} className="rounded-sm border bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold leading-5">{item.label}</p>
                    <StatusPill tone={priorityTone(item.priority)}>{item.count}</StatusPill>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border bg-card p-5">
            <h3 className="text-lg font-bold">Automation Pulse</h3>
            <div className="mt-4 space-y-4">
              {[
                ["Order confirmations", "98.7%", "Sent within two minutes"],
                ["Payment reminders", "64", "Corporate accounts queued"],
                ["Refill reminders", "240", "Student segment ready"],
                ["Delivery reminders", "312", "Scheduled by slot"]
              ].map(([label, value, detail]) => (
                <div key={label} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-lg font-bold">{value}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}
