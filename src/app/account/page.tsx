"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Loader2,
  LogOut,
  Mail,
  Package,
  Phone,
  ShoppingBag,
  ShoppingCart,
  UserRound
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButton, CustomerButtonLink } from "@/components/customer/customer-button";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCurrency } from "@/lib/utils";
import { AccountLookupSkeleton, AccountPageSkeleton } from "@/components/skeletons/customer-skeletons";
import { formatOrderLineItem, type CustomerOrder } from "@/modules/orders/customer-order";

type AccountLookup = {
  orderCount: number;
  points: number;
  lastOrder: CustomerOrder | null;
};

function profileInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isLoading, logout } = useCustomerAuth();
  const { itemCount } = useCart();
  const [lookup, setLookup] = useState<AccountLookup | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = profile?.fullName?.trim() || user?.email || "Customer";
  const initials = useMemo(() => profileInitials(displayName), [displayName]);
  const lastOrder = lookup?.lastOrder ?? null;

  useEffect(() => {
    if (!profile?.phoneNumber) {
      setLookup(null);
      return;
    }

    let cancelled = false;
    setLookupLoading(true);

    fetch(`/api/v1/customers/lookup?phone=${encodeURIComponent(profile.phoneNumber)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!cancelled && response.ok) {
          setLookup(payload.data ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLookupLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profile?.phoneNumber]);

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <CustomerShell showAssistant={false} compactFooter>
      <main className="pb-16">
        <section className="customer-section max-w-lg">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <UserRound className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-balance text-3xl font-black tracking-tight text-slate-950">Your account</h1>
          <p className="mt-2 max-w-[42ch] text-sm leading-6 text-muted-foreground">
            {user
              ? "Your cart, orders, and delivery details in one place."
              : "Sign in to save your cart and pick up where you left off."}
          </p>

          {isLoading ? (
            <AccountPageSkeleton />
          ) : user ? (
            <div className="mt-6 space-y-4">
              <div className="customer-card p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-aqua/60 text-base font-bold text-primary"
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground">Signed in as</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{displayName}</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
                        <dd className="truncate">{user.email}</dd>
                      </div>
                      {profile?.phoneNumber ? (
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
                          <dd>{profile.phoneNumber}</dd>
                        </div>
                      ) : null}
                    </dl>
                    {lookup && lookup.orderCount > 0 ? (
                      <p className="mt-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{lookup.orderCount}</span>{" "}
                        {lookup.orderCount === 1 ? "order" : "orders"} placed
                        {lookup.points > 0 ? (
                          <>
                            {" "}
                            · <span className="font-semibold text-foreground">{lookup.points}</span> loyalty points
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {lookupLoading ? (
                <AccountLookupSkeleton />
              ) : lastOrder ? (
                <article className="customer-card border-primary/15 bg-aqua/25 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Latest order</p>
                      <p className="mt-2 text-sm font-bold text-foreground">{formatOrderLineItem(lastOrder)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {lastOrder.orderNumber} · {formatCurrency(lastOrder.total)}
                      </p>
                    </div>
                    <StatusPill tone={lastOrder.status === "completed" ? "good" : "neutral"}>
                      {lastOrder.status.replaceAll("_", " ")}
                    </StatusPill>
                  </div>
                  <CustomerButtonLink
                    href={`/order/${lastOrder.orderNumber}`}
                    variant="outline"
                    className="mt-4 w-full justify-between"
                  >
                    View receipt
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </CustomerButtonLink>
                </article>
              ) : null}

              <div className="customer-card space-y-3 p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
                <div className="grid gap-3">
                  <CustomerButtonLink href="/cart" className="w-full justify-between">
                    <span className="inline-flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                      View cart
                    </span>
                    {itemCount > 0 ? (
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    ) : null}
                  </CustomerButtonLink>
                  <CustomerButtonLink href="/order" variant="outline" className="w-full justify-start gap-2">
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    Continue shopping
                  </CustomerButtonLink>
                  <CustomerButtonLink href="/track" variant="outline" className="w-full justify-start gap-2">
                    <Package className="h-4 w-4" aria-hidden="true" />
                    Track an order
                  </CustomerButtonLink>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isSigningOut}
                className="focus-ring flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-white px-6 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Signing out…
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="customer-card mt-6 space-y-5 p-6 sm:p-8">
              <div className="rounded-2xl border border-cyan-100 bg-aqua/30 px-4 py-3 text-sm leading-6 text-primary">
                Sign in to manage your cart, reuse saved details at checkout, and view order receipts.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <CustomerButtonLink href="/login?next=/account">Sign in</CustomerButtonLink>
                <CustomerButtonLink href="/signup?next=/account" variant="outline">
                  Create account
                </CustomerButtonLink>
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="focus-ring inline-flex min-h-11 items-center rounded-xl px-2 font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              Back to home
            </Link>
            {user ? (
              <>
                {" · "}
                <Link
                  href="/assistant"
                  className="focus-ring inline-flex min-h-11 items-center rounded-xl px-2 font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
                >
                  Ask the assistant
                </Link>
              </>
            ) : null}
          </p>
        </section>
      </main>
    </CustomerShell>
  );
}
