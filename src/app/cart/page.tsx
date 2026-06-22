"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButton, CustomerButtonLink } from "@/components/customer/customer-button";
import { CartLineList } from "@/components/cart/cart-line-list";
import { useCart } from "@/components/cart/cart-provider";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  const { items, subtotal, isLoading, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent("/cart")}`);
    }
  }, [authLoading, isAuthenticated, router]);

  if (!authLoading && !isAuthenticated) {
    return null;
  }

  return (
    <CustomerShell showAssistant={false}>
      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#061a4f]">Your cart</h1>
        <p className="mt-2 text-sm text-slate-600">Review your items before checkout.</p>

        <div className="mt-6">
          {authLoading || isLoading ? (
            <p className="text-sm text-slate-600">Loading cart...</p>
          ) : (
            <CartLineList items={items} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
          )}
        </div>

        {items.length > 0 ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-[#061a4f]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Delivery fee is calculated at checkout.</p>
            <CustomerButtonLink href="/order?from=cart" className="mt-4 w-full">
              Continue to checkout
            </CustomerButtonLink>
          </div>
        ) : (
          <div className="mt-6">
            <CustomerButtonLink href="/order">Browse products</CustomerButtonLink>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/order" className="underline underline-offset-2">
            Continue shopping
          </Link>
        </p>
      </section>
    </CustomerShell>
  );
}
