"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ServiceType } from "@/lib/orders/order-wizard";
import type { CartItemRecord } from "@/modules/customer/profile";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";

export type AddCartItemInput = {
  sku: string;
  serviceType: ServiceType;
  quantity: number;
  refillLitres?: number;
  containerCount?: number;
  productName: string;
  unitPrice: number;
};

type CartContextValue = {
  items: CartItemRecord[];
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  cartSkus: Set<string>;
  refresh: () => Promise<void>;
  addItem: (item: AddCartItemInput) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineTotal(item: CartItemRecord) {
  if (item.serviceType === "refill") {
    return item.unitPrice * item.refillLitres;
  }
  return item.unitPrice * Math.max(item.quantity, 1);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  const [items, setItems] = useState<CartItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/cart", { cache: "no-store" });
      const payload = await response.json();
      if (response.ok) {
        setItems(payload.data ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      refresh();
    }
  }, [authLoading, refresh]);

  const addItem = useCallback(async (item: AddCartItemInput) => {
    const response = await fetch("/api/v1/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: item.sku,
        serviceType: item.serviceType,
        quantity: item.quantity,
        refillLitres: item.refillLitres ?? 0,
        containerCount: item.containerCount ?? 1,
        productName: item.productName,
        unitPrice: item.unitPrice
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Could not add to cart");
    }

    setItems((current) => {
      const without = current.filter((row) => row.sku !== item.sku);
      return [payload.data, ...without];
    });
  }, []);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    const response = await fetch(`/api/v1/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Could not update cart");
    }

    setItems((current) => current.map((row) => (row.id === id ? payload.data : row)));
  }, []);

  const removeItem = useCallback(async (id: string) => {
    const response = await fetch(`/api/v1/cart/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error ?? "Could not remove item");
    }
    setItems((current) => current.filter((row) => row.id !== id));
  }, []);

  const clearCart = useCallback(async () => {
    const response = await fetch("/api/v1/cart", { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error ?? "Could not clear cart");
    }
    setItems([]);
  }, []);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + (item.serviceType === "refill" ? 1 : Math.max(item.quantity, 1)), 0);
    const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
    const cartSkus = new Set(items.map((item) => item.sku));

    return {
      items,
      isLoading: authLoading || isLoading,
      itemCount,
      subtotal,
      cartSkus,
      refresh,
      addItem,
      updateQuantity,
      removeItem,
      clearCart
    };
  }, [items, authLoading, isLoading, refresh, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
