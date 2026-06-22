"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandImage } from "@/components/customer/brand-image";
import { CustomerAccountActions } from "@/components/customer/customer-account-actions";
import { CustomerButtonLink, CustomerExternalLink } from "@/components/customer/customer-button";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { buildWhatsAppLink } from "@/lib/contact";

const navLinks = [
  { href: "/order", label: "Order" },
  { href: "/track", label: "Track" },
  { href: "/corporate", label: "Corporate" }
];

const whatsappHref = buildWhatsAppLink();

export function CustomerHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-100 bg-white text-primary shadow-sm shadow-cyan-950/5">
      <div className="flex items-center justify-center gap-2 bg-aqua/55 px-4 py-2 text-center text-xs font-semibold text-primary sm:text-sm">
        <span>Fresh water refills, bottled water, ice and delivery across campus &amp; Gaborone.</span>
        <Link
          href="/#services"
          className="focus-ring hidden shrink-0 font-bold text-primary underline underline-offset-2 hover:text-primary-hover sm:inline"
        >
          View services
        </Link>
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
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
            <span className="hidden text-sm font-extrabold leading-tight text-primary sm:block">
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
                  "focus-ring rounded-xl px-3.5 py-2 text-sm font-bold transition-colors",
                  active ? "bg-aqua/65 text-primary" : "text-primary/85 hover:bg-aqua/55 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CustomerButtonLink href="/order" className="h-10 px-5 text-sm font-extrabold">
            Order
          </CustomerButtonLink>
          <CustomerExternalLink
            href={whatsappHref}
            variant="whatsapp"
            className="h-10 px-4 text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </CustomerExternalLink>
          <CustomerAccountActions
            loginClassName="border border-cyan-100 bg-white text-primary shadow-cyan-900/5"
            iconClassName="border border-cyan-100 bg-white text-primary shadow-cyan-900/5"
          />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CustomerButtonLink href="/order" className="h-10 px-4 text-sm font-bold">
            Order
          </CustomerButtonLink>
          <CustomerExternalLink
            href={whatsappHref}
            variant="whatsapp"
            className="h-10 w-10 px-0"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </CustomerExternalLink>
          <CustomerAccountActions
            loginClassName="border border-cyan-100 bg-white text-primary shadow-cyan-900/5 shadow-sm"
            iconClassName="border border-cyan-100 bg-white text-primary shadow-cyan-900/5 shadow-sm"
          />
          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-white text-primary shadow-sm shadow-cyan-900/5"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-cyan-100 bg-white", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => {
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
