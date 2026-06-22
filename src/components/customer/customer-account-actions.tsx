"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, ShoppingCart, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";

export function CustomerAccountActions({
  className,
  iconClassName,
  loginClassName
}: {
  className?: string;
  iconClassName?: string;
  loginClassName?: string;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const { itemCount } = useCart();
  const loginHref = `/login?next=${encodeURIComponent(pathname === "/login" || pathname === "/signup" ? "/order" : pathname)}`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isAuthenticated ? (
        <Link
          href="/account"
          className={cn("focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold", loginClassName)}
          aria-label="Your account"
        >
          <UserRound className="h-4 w-4" />
          <span className="hidden sm:inline">Account</span>
        </Link>
      ) : (
        <Link
          href={loginHref}
          aria-label="Login"
          className={cn("focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold", loginClassName)}
        >
          <LogIn className="h-4 w-4 sm:hidden" aria-hidden="true" />
          Login
        </Link>
      )}

      <Link
        href="/cart"
        aria-label="View cart"
        className={cn("focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-xl", iconClassName)}
      >
        <ShoppingCart className="h-5 w-5" />
        {!isLoading && itemCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
