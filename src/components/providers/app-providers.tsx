"use client";

import { CustomerAuthProvider } from "@/components/customer/customer-auth-provider";
import { CartProvider } from "@/components/cart/cart-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>{children}</CartProvider>
    </CustomerAuthProvider>
  );
}
