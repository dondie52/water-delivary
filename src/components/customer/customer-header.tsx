"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { buildPhoneLink } from "@/lib/contact";

const navLinks = [
  { href: "/order", label: "Order" },
  { href: "/track", label: "Track" },
  { href: "/corporate", label: "Corporate" }
];

const contactHref = buildPhoneLink();

export function CustomerHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-cyan-100 bg-white text-primary shadow-sm shadow-cyan-950/5"
      )}
    >
      <div className="px-4 py-2 text-center text-xs font-semibold text-primary sm:text-sm bg-aqua/55">
        Fresh water refills, bottled water, ice and delivery across campus &amp; Gaborone.
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            className={cn(
              "focus-ring hidden h-10 w-10 items-center justify-center rounded-xl text-primary hover:bg-aqua/55 lg:inline-flex"
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
            <span className={cn("hidden text-sm font-extrabold leading-tight tracking-wide sm:block", isHome ? "text-primary" : "text-primary")}>
              Fresh Water
              <span className="block text-xs font-semibold text-primary/70">Market</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-aqua/65 text-primary" : "text-primary/85 hover:bg-aqua/55 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/order"
            className={cn(
              "focus-ring ml-3 inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#08466f]"
            )}
          >
            Get Started
            <span aria-hidden="true">&gt;</span>
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={contactHref}
            className={cn(
              "focus-ring inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-primary/85 transition-colors hover:bg-aqua/55 hover:text-primary"
            )}
          >
            <Phone className="h-5 w-5" />
            Contact
          </a>
          <Link
            href="/order"
            aria-label="Start order"
            className={cn(
              "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl text-primary/85 transition-colors hover:bg-aqua/55 hover:text-primary"
            )}
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/order"
            className={cn(
              "focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-sm shadow-cyan-900/10"
            )}
          >
            Order
          </Link>
          <a
            href={contactHref}
            aria-label="Contact Fresh Water Market"
            className={cn(
              "focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-cyan-100 bg-white px-3 text-sm font-bold text-primary shadow-sm shadow-cyan-900/5"
            )}
          >
            <Phone className="h-4 w-4" />
            Contact
          </a>
          <button
            type="button"
            className={cn(
              "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-white text-primary shadow-sm shadow-cyan-900/5"
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
          "border-t border-cyan-100 bg-white",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {[...navLinks, { href: "/subscriptions", label: "Subscriptions" }].map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                  active ? "bg-aqua/65 text-primary" : "text-primary/85 hover:bg-aqua/55 hover:text-primary"
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
