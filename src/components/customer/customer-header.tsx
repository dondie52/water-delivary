"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogIn, Menu, Phone, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { buildPhoneLink } from "@/lib/contact";

const navLinks = [
  { href: "/order", label: "Shop" },
  { href: "/#services", label: "Discover" },
  { href: "/#pickup", label: "Find In-Store" }
];

const contactHref = buildPhoneLink();

export function CustomerHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        isHome
          ? "hero-navy border-b border-white/10 text-white"
          : "border-b border-cyan-100 bg-white text-primary shadow-sm shadow-cyan-950/5"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold sm:text-sm",
          isHome ? "bg-[#04123a] text-cyan-50" : "bg-aqua/55 text-primary"
        )}
      >
        <span>Fresh water refills, bottled water, ice and delivery across campus &amp; Gaborone.</span>
        <Link
          href="/order"
          className={cn(
            "focus-ring hidden shrink-0 font-bold underline underline-offset-2 sm:inline",
            isHome ? "text-white hover:text-cyan-100" : "text-primary hover:text-[#08466f]"
          )}
        >
          Learn more
        </Link>
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            className={cn(
              "focus-ring hidden h-10 w-10 items-center justify-center rounded-xl lg:inline-flex",
              isHome ? "text-white hover:bg-white/10" : "text-primary hover:bg-aqua/55"
            )}
            aria-label="Open navigation"
            onClick={() => setOpen((current) => !current)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="focus-ring flex min-w-0 items-center gap-3 rounded-xl"
            aria-label="Fresh Water Market home"
          >
            <BrandImage
              src={BRAND_ASSETS.logo}
              alt="Fresh Water Market"
              fit="contain"
              className="h-11 w-auto max-w-[148px] object-contain"
              fallbackLabel="Fresh Water Market"
              width={400}
              height={120}
              priority
            />
            <span
              className={cn(
                "hidden text-sm font-extrabold leading-tight tracking-wide sm:block",
                isHome ? "text-white" : "text-primary"
              )}
            >
              Fresh Water
              <span
                className={cn(
                  "block text-xs font-semibold",
                  isHome ? "text-cyan-100/80" : "text-primary/70"
                )}
              >
                Market
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/order"
            className={cn(
              "focus-ring mr-3 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-extrabold transition-colors",
              isHome
                ? "bg-white text-[#061a4f] hover:bg-cyan-50"
                : "bg-primary text-white hover:bg-[#08466f]"
            )}
          >
            Get Started
            <span aria-hidden="true">&gt;</span>
          </Link>
          {navLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-xl px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition-colors",
                  isHome
                    ? "text-white/90 hover:bg-white/10 hover:text-white"
                    : active
                      ? "bg-aqua/65 text-primary"
                      : "text-primary/85 hover:bg-aqua/55 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={contactHref}
            className={cn(
              "focus-ring inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors",
              isHome
                ? "text-white/90 hover:bg-white/10 hover:text-white"
                : "text-primary/85 hover:bg-aqua/55 hover:text-primary"
            )}
          >
            <Phone className="h-5 w-5" />
            Contact
          </a>
          <Link
            href="/order"
            aria-label="Start order"
            className={cn(
              "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              isHome
                ? "text-white/90 hover:bg-white/10 hover:text-white"
                : "text-primary/85 hover:bg-aqua/55 hover:text-primary"
            )}
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/order"
            className={cn(
              "focus-ring inline-flex h-10 items-center rounded-xl px-4 text-sm font-bold shadow-sm shadow-cyan-900/10",
              isHome ? "bg-white text-[#061a4f]" : "bg-primary text-white"
            )}
          >
            Order
          </Link>
          <Link
            href="/staff/login"
            aria-label="Login"
            className={cn(
              "focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold shadow-sm",
              isHome
                ? "border border-white/30 bg-white/10 text-white"
                : "border border-cyan-100 bg-white text-primary shadow-cyan-900/5"
            )}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
          <Link
            href="/order"
            aria-label="View cart"
            className={cn(
              "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
              isHome
                ? "border border-white/30 bg-white/10 text-white"
                : "border border-cyan-100 bg-white text-primary shadow-cyan-900/5"
            )}
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className={cn(
              "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
              isHome
                ? "border border-white/30 bg-white/10 text-white"
                : "border border-cyan-100 bg-white text-primary shadow-cyan-900/5"
            )}
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t",
          open ? "block" : "hidden",
          isHome ? "border-white/10 bg-[#04123a]" : "border-cyan-100 bg-white"
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {[...navLinks, { href: "/track", label: "Track" }, { href: "/subscriptions", label: "Subscriptions" }].map(
            (link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                    isHome
                      ? "text-white/90 hover:bg-white/10 hover:text-white"
                      : active
                        ? "bg-aqua/65 text-primary"
                        : "text-primary/85 hover:bg-aqua/55 hover:text-primary"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            }
          )}
        </nav>
      </div>
    </header>
  );
}
