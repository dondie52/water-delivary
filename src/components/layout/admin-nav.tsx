"use client";

import Link from "next/link";
import { AlertTriangle, BarChart3, Boxes, BriefcaseBusiness, ClipboardCheck, ClipboardList, Gauge, LayoutDashboard, ListChecks, LogOut, Megaphone, Percent, Printer, Repeat2, Rocket, Settings, ShieldCheck, ShoppingBag, Truck, Users } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/operations", label: "Operations", icon: Gauge },
  { href: "/admin/manifest", label: "Manifest", icon: Printer },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/promos", label: "Promos", icon: Percent },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: Repeat2 },
  { href: "/admin/corporate", label: "Corporate", icon: BriefcaseBusiness },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/launch", label: "Launch", icon: ClipboardCheck },
  { href: "/admin/audit", label: "Audit", icon: ShieldCheck },
  { href: "/admin/errors", label: "Errors", icon: AlertTriangle },
  { href: "/admin/qa", label: "QA", icon: ListChecks },
  { href: "/admin/deployment", label: "Deploy", icon: Rocket },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/driver", label: "Driver Board", icon: Truck }
];

export function AdminNav() {
  async function logout() {
    await fetch("/api/v1/staff/logout", { method: "POST" });
    window.location.href = "/staff/login";
  }

  return (
    <nav className="border-b border-cyan-100/70 bg-aqua/50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-primary">
              <Icon className="h-4 w-4 text-water" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
        <button type="button" onClick={logout} className="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-primary">
          <LogOut className="h-4 w-4 text-water" aria-hidden="true" />
          Logout
        </button>
      </div>
    </nav>
  );
}
