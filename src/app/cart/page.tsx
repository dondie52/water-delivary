"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButtonLink } from "@/components/customer/customer-button";
import { CartLineList } from "@/components/cart/cart-line-list";
import { useCart } from "@/components/cart/cart-provider";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";
import { formatCurrency } from "@/lib/utils";
import { CartPageSkeleton } from "@/components/skeletons/customer-skeletons";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  const { items, subtotal, isLoading, itemCount, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent("/cart")}`);
    }
  }, [authLoading, isAuthenticated, router]);

  if (!authLoading && !isAuthenticated) {
    return null;
  }

  const isPageLoading = authLoading || isLoading;
  const hasItems = items.length > 0;

  return (
    <CustomerShell showAssistant={false} compactFooter>
      <main className={hasItems ? "pb-32 sm:pb-16" : "pb-16"}>
        <section className="customer-section max-w-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <ShoppingCart className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-balance text-3xl font-black tracking-tight text-slate-950">Your cart</h1>
          <p className="mt-2 max-w-[42ch] text-sm leading-6 text-muted-foreground">
            {isPageLoading
              ? "Loading your items…"
              : hasItems
                ? `${itemCount} ${itemCount === 1 ? "item" : "items"} ready for checkout.`
                : "No items yet — add products from the order page."}
          </p>

          <div className="mt-6">
            {isPageLoading ? (
              <CartPageSkeleton />
            ) : (
              <CartLineList items={items} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
            )}
          </div>

          {!isPageLoading && hasItems ? (
            <>
              <div className="customer-card mt-4 space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">Delivery fee is calculated at checkout.</p>
                <CustomerButtonLink href="/order?from=cart" className="w-full">
                  Continue to checkout
                </CustomerButtonLink>
              </div>

              <div
                className="fixed inset-x-0 bottom-0 z-20 border-t border-cyan-100 bg-white/95 p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:hidden"
                aria-label="Cart checkout summary"
              >
                <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Subtotal</p>
                    <p className="text-base font-bold text-foreground">{formatCurrency(subtotal)}</p>
                  </div>
                  <CustomerButtonLink href="/order?from=cart" className="min-w-[10.5rem] shrink-0 px-5">
                    Checkout
                  </CustomerButtonLink>
                </div>
              </div>
            </>
          ) : null}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              href="/order"
              className="focus-ring inline-flex min-h-11 items-center rounded-xl px-2 font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              Continue shopping
            </Link>
            {" · "}
            <Link
              href="/account"
              className="focus-ring inline-flex min-h-11 items-center rounded-xl px-2 font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              Your account
            </Link>
          </p>
        </section>
      </main>
    </CustomerShell>
  );
}
