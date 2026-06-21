import Link from "next/link";
import { Phone } from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { buildPhoneLink, FWM_PHONE_DISPLAY, FWM_WHATSAPP } from "@/lib/contact";

export function FinalCtaSection({ whatsappNumber = FWM_WHATSAPP }: { whatsappNumber?: string }) {
  const contactHref = buildPhoneLink(whatsappNumber);

  return (
    <section id="cta">
      <div className="customer-section w-full">
        <div className="relative isolate overflow-hidden rounded-2xl bg-primary px-6 py-9 text-center shadow-sm shadow-cyan-900/10 sm:px-10">
          <BrandImage
            src={BRAND_ASSETS.logo}
            alt="Fresh Water Market"
            fit="contain"
            className="mx-auto mb-5 h-14 w-auto max-w-[200px] rounded-2xl bg-white px-4 py-2 shadow-sm"
            fallbackLabel="Fresh Water Market"
            width={206}
            height={206}
          />
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Order water in under a minute.</h2>
          <p className="mx-auto mt-2 max-w-md text-base text-cyan-50/90">
            Pickup around campus or student delivery from P30. Contact us for help.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/order"
              className="focus-ring inline-flex h-12 items-center justify-center rounded-2xl bg-white px-7 text-base font-bold text-primary shadow-sm transition-colors hover:bg-aqua"
            >
              Start order
            </Link>
            <Link
              href="/track"
              className="focus-ring inline-flex h-12 items-center justify-center rounded-2xl border border-white/55 px-7 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              Track order
            </Link>
            <a
              href={contactHref}
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/55 px-7 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              <Phone className="h-5 w-5" />
              Contact us
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-cyan-50/90">
            <a
              href={`tel:${FWM_PHONE_DISPLAY.replace(/\s/g, "")}`}
              className="focus-ring inline-flex items-center gap-2 font-semibold hover:text-white"
            >
              <Phone className="h-4 w-4" />
              {FWM_PHONE_DISPLAY}
            </a>
            <span aria-hidden="true">·</span>
            <Link href="/subscriptions" className="font-semibold underline hover:text-white">
              Subscriptions
            </Link>
            <span aria-hidden="true">·</span>
            <span>Fresh Water Market — Gaborone</span>
          </div>
        </div>
      </div>
    </section>
  );
}
