import Link from "next/link";
import {
  CheckCircle2,
  Droplets,
  MapPin,
  MessageCircle,
  Package,
  Snowflake,
  Sparkles,
  Truck,
  type LucideIcon
} from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { HeroQuickStartGrid } from "@/components/customer/hero-quick-start-grid";
import { CustomerButtonLink, CustomerExternalLink } from "@/components/customer/customer-button";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { buildWhatsAppLink, FWM_WHATSAPP } from "@/lib/contact";
import type { PriceItem } from "@/modules/catalog/pricing";

const trustPoints = [
  { icon: CheckCircle2, label: "Refills from P1.60/L" },
  { icon: Truck, label: "Student delivery from P30" },
  { icon: MapPin, label: "Campus pickup points" }
];

type CategoryItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  image: string;
};

const categories: CategoryItem[] = [
  { label: "Refills", href: "/order?service=refill", icon: Droplets, image: BRAND_ASSETS.categories.refill },
  { label: "Bottled", href: "/order?service=bottled", icon: Package, image: BRAND_ASSETS.categories.bottled },
  { label: "Branded", href: "/order?service=personalized", icon: Sparkles, image: BRAND_ASSETS.categories.branded },
  { label: "Ice", href: "/order?service=ice", icon: Snowflake, image: BRAND_ASSETS.categories.ice },
  { label: "Delivery", href: "/order", icon: Truck, image: BRAND_ASSETS.categories.delivery }
];

export function HeroSection({
  whatsappNumber = FWM_WHATSAPP,
  catalog = []
}: {
  whatsappNumber?: string;
  catalog?: PriceItem[];
}) {
  const whatsappHref = buildWhatsAppLink(undefined, whatsappNumber);

  return (
    <section id="hero" className="relative overflow-hidden bg-background text-foreground">
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-water">Stay Fresh. Stay Hydrated.</p>

          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground">
            Fresh Water Delivered Across Campus &amp; Gaborone
          </h1>

          <p className="mt-5 max-w-md text-base font-medium leading-7 text-muted-foreground sm:text-lg">
            Refills, bottled water, ice, and branded bottles &mdash; pickup points or student
            delivery from P30.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <CustomerButtonLink href="/order" className="px-8 text-base font-extrabold">
              Start Water Delivery
            </CustomerButtonLink>
            <CustomerButtonLink href="#pricing" variant="outline" className="px-8 text-base font-extrabold">
              Explore Water Services
            </CustomerButtonLink>
          </div>

          <dl className="mt-7 flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
            {trustPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div
                  key={point.label}
                  className="flex items-center gap-2 rounded-full bg-aqua px-3 py-2 ring-1 ring-cyan-100"
                >
                  <Icon className="h-4 w-4 text-water" />
                  {point.label}
                </div>
              );
            })}
          </dl>

          <CustomerExternalLink
            href={whatsappHref}
            variant="whatsapp"
            className="mt-4 h-10 px-4 text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </CustomerExternalLink>
        </div>

        <div className="relative hidden lg:block">
          <HeroQuickStartGrid catalog={catalog} />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <p className="text-sm font-bold text-foreground">What are you looking for?</p>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-start sm:gap-4 sm:overflow-visible sm:px-0">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.label}
                href={category.href}
                className="focus-ring group flex min-h-11 min-w-[4.75rem] shrink-0 flex-col items-center justify-center gap-2 rounded-xl px-1 py-1 text-center transition-colors hover:bg-aqua/40"
              >
                <span className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-full bg-aqua text-primary ring-1 ring-cyan-100 transition duration-200 group-hover:ring-2 group-hover:ring-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <BrandImage
                    src={category.image}
                    alt=""
                    className="absolute inset-0 h-full w-full"
                    fit="cover"
                    fallbackLabel=""
                    width={128}
                    height={128}
                    sizes="72px"
                  />
                </span>
                <span className="text-xs font-bold leading-tight text-foreground">{category.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
