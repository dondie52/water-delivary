import Link from "next/link";
import {
  Building2,
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
import { CustomerButtonLink, CustomerExternalLink } from "@/components/customer/customer-button";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { buildWhatsAppLink, FWM_WHATSAPP } from "@/lib/contact";

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
  { label: "Water Refill", href: "/order?service=refill", icon: Droplets, image: BRAND_ASSETS.categories.refill },
  { label: "Bottled Water", href: "/order?service=bottled", icon: Package, image: BRAND_ASSETS.categories.bottled },
  { label: "Branded Bottles", href: "/order?service=personalized", icon: Sparkles, image: BRAND_ASSETS.categories.branded },
  { label: "Ice Supply", href: "/order?service=ice", icon: Snowflake, image: BRAND_ASSETS.categories.ice },
  { label: "Student Delivery", href: "/order", icon: Truck, image: BRAND_ASSETS.categories.delivery },
  { label: "Campus Pickup", href: "/#pickup", icon: MapPin, image: BRAND_ASSETS.categories.pickup },
  { label: "Corporate", href: "/corporate", icon: Building2, image: BRAND_ASSETS.categories.corporate }
];

export function HeroSection({ whatsappNumber = FWM_WHATSAPP }: { whatsappNumber?: string }) {
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

        <div className="relative">
          <BrandImage
            src={BRAND_ASSETS.heroBanner}
            alt="Fresh Water Market bottled water, refills, and branded bottles"
            className="relative z-10 mx-auto aspect-[4/3] w-full max-w-xl rounded-3xl object-contain"
            fit="contain"
            fallbackLabel="Fresh Water Market delivery"
            width={1000}
            height={750}
            sizes="(min-width: 1024px) 520px, 100vw"
            priority
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <p className="text-sm font-bold text-foreground">What are you looking for?</p>
        <div className="mt-5 flex gap-5 overflow-x-auto pb-2 sm:flex-wrap sm:justify-start sm:overflow-visible">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.label}
                href={category.href}
                className="focus-ring group flex w-20 shrink-0 flex-col items-center gap-2 text-center"
              >
                <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-aqua text-primary ring-1 ring-cyan-100 transition duration-200 group-hover:ring-2 group-hover:ring-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <BrandImage
                    src={category.image}
                    alt={category.label}
                    className="absolute inset-0 h-full w-full"
                    fit="cover"
                    fallbackLabel=""
                    width={128}
                    height={128}
                    sizes="64px"
                  />
                </span>
                <span className="text-[11px] font-bold leading-tight text-foreground">{category.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
