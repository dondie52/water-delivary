import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Droplets,
  MapPin,
  Package,
  Snowflake,
  Sparkles,
  Truck,
  type LucideIcon
} from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { buildPhoneLink, FWM_WHATSAPP } from "@/lib/contact";

const trustPoints = [
  { icon: CheckCircle2, label: "Refills from P1.60/L" },
  { icon: Truck, label: "Student delivery from P30" },
  { icon: MapPin, label: "Campus pickup points" }
];

type CategoryItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const categories: CategoryItem[] = [
  { label: "Water Refill", href: "/order?service=refill", icon: Droplets },
  { label: "Bottled Water", href: "/order?service=bottled", icon: Package },
  { label: "Branded Bottles", href: "/order?service=personalized", icon: Sparkles },
  { label: "Ice Supply", href: "/order?service=ice", icon: Snowflake },
  { label: "Student Delivery", href: "/order", icon: Truck },
  { label: "Campus Pickup", href: "/#pickup", icon: MapPin },
  { label: "Corporate", href: "/corporate", icon: Building2 }
];

export function HeroSection({ whatsappNumber = FWM_WHATSAPP }: { whatsappNumber?: string }) {
  const contactHref = buildPhoneLink(whatsappNumber);

  return (
    <section id="hero" className="hero-navy relative overflow-hidden text-white">
      <div className="hero-sunburst pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-16">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-extrabold leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
            Hydration,
            <span className="block text-water">Delivered.</span>
          </h1>

          <p className="mt-5 max-w-md text-base font-medium leading-7 text-cyan-50/90 sm:text-lg">
            Fresh Water Market brings refills, bottled water, ice, and branded
            bottles to campus and across Gaborone &mdash; pickup points or student
            delivery from P30.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order"
              className="focus-ring inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-extrabold text-[#061a4f] shadow-lg shadow-cyan-950/20 transition-colors hover:bg-cyan-50"
            >
              Start Water Delivery
            </Link>
            <Link
              href="#pricing"
              className="focus-ring inline-flex h-12 items-center justify-center rounded-full border-2 border-white/70 bg-white/0 px-8 text-base font-extrabold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Explore Water Services
            </Link>
          </div>

          <dl className="mt-7 flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
            {trustPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div
                  key={point.label}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20 backdrop-blur-sm"
                >
                  <Icon className="h-4 w-4 text-water" />
                  {point.label}
                </div>
              );
            })}
          </dl>

          <a
            href={contactHref}
            className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-cyan-50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CheckCircle2 className="h-4 w-4 text-water" />
            Contact us for help
          </a>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-0 rounded-full bg-water/20 blur-3xl" aria-hidden="true" />
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
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100/80">
          What are you looking for?
        </p>
        <div className="mt-5 flex gap-5 overflow-x-auto pb-2 sm:flex-wrap sm:justify-start sm:overflow-visible">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.label}
                href={category.href}
                className="focus-ring group flex w-20 shrink-0 flex-col items-center gap-2 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-[#061a4f]">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-[11px] font-bold leading-tight text-cyan-50">
                  {category.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <svg
        className="relative block w-full text-white"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 60 C 240 90 480 90 720 60 C 960 30 1200 30 1440 60 L 1440 90 L 0 90 Z"
        />
      </svg>
    </section>
  );
}
