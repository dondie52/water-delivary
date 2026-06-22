"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CustomerProfile } from "@/modules/customer/profile";

type CustomerUser = {
  id: string;
  email: string;
};

type CustomerAuthContextValue = {
  user: CustomerUser | null;
  profile: CustomerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/v1/customers/me", { cache: "no-store" });
    const payload = await response.json();

    if (response.ok && payload.data) {
      setUser(payload.data.user);
      setProfile(payload.data.profile);
    } else {
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/v1/customers/logout", { method: "POST" });
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated: Boolean(user),
      refresh,
      logout
    }),
    [user, profile, isLoading, refresh, logout]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
}
