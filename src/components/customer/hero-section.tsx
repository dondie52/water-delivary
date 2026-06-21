import Link from "next/link";
import { CheckCircle2, MapPin, Phone, Truck } from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { buildPhoneLink, FWM_WHATSAPP } from "@/lib/contact";

const trustPoints = [
  { icon: CheckCircle2, label: "Refills from P1.60/L" },
  { icon: Truck, label: "Student delivery from P30" },
  { icon: MapPin, label: "Campus pickup points" }
];

export function HeroSection({ whatsappNumber = FWM_WHATSAPP }: { whatsappNumber?: string }) {
  const contactHref = buildPhoneLink(whatsappNumber);

  return (
    <section id="hero" className="bg-aqua/45">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-14">
        <div className="max-w-2xl">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-[-0.02em] text-[#061a4f] sm:text-5xl lg:text-6xl">
            Fresh water delivered across campus &amp; Gaborone
          </h1>

          <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-primary/85 sm:text-lg">
            Refills, bottled water, ice, and branded bottles with pickup points and student delivery from P30.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order"
              className="focus-ring inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-extrabold text-white shadow-sm shadow-cyan-900/10 transition-colors hover:bg-[#08466f]"
            >
              Start order
            </Link>
            <Link
              href="#pricing"
              className="focus-ring inline-flex h-12 items-center justify-center rounded-2xl border border-primary/25 bg-white px-8 text-base font-extrabold text-primary transition-colors hover:border-primary hover:bg-white"
            >
              View prices
            </Link>
          </div>

          <dl className="mt-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
            {trustPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div key={point.label} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-cyan-100">
                  <Icon className="h-4 w-4 text-water" />
                  {point.label}
                </div>
              );
            })}
          </dl>

          <a
            href={contactHref}
            className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-white"
          >
            <Phone className="h-4 w-4 text-water" />
            Contact us for help
          </a>
        </div>

        <div className="surface-strong overflow-hidden p-3">
          <BrandImage
            src={BRAND_ASSETS.heroBanner}
            alt="Fresh Water Market bottled water ready for pickup and delivery"
            className="aspect-[4/3] w-full rounded-xl sm:aspect-[16/11]"
            fallbackLabel="Fresh Water Market delivery"
            width={1000}
            height={720}
            sizes="(min-width: 1024px) 520px, 100vw"
            priority
          />
          <div className="grid gap-2 pt-3 sm:grid-cols-2">
            <div className="rounded-xl bg-aqua/60 px-4 py-3 text-primary">
              <p className="text-xs font-bold text-primary/75">Refills from</p>
              <p className="text-lg font-extrabold">P1.60 / litre</p>
            </div>
            <div className="rounded-xl bg-aqua/60 px-4 py-3 text-primary">
              <p className="text-xs font-bold text-primary/75">Student delivery</p>
              <p className="text-lg font-extrabold">from P30</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
