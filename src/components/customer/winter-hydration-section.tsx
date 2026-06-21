import Link from "next/link";
import { ArrowRight, Droplets, MapPin, Snowflake, Sparkles } from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";

const winterBenefits = ["Boosts immunity", "Keeps you energized", "Helps digestion", "Maintains body temperature"];

export function WinterHydrationSection() {
  return (
    <section className="bg-white px-4 py-14 text-[#061a4f] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-aqua px-3.5 py-2 text-sm font-extrabold text-primary ring-1 ring-primary/10">
            <Snowflake className="h-4 w-4" />
            Winter hydration
          </div>

          <h2 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-[#061a4f] sm:text-4xl">
            Winter Wellness starts with water
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-primary/85">
            Stay healthy and energized this winter - it all starts with water. Visit Fresh Water
            Market for refills, custom bottles, and more.
          </p>

          <p className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-primary ring-1 ring-primary/10">
            <MapPin className="h-4 w-4 shrink-0" />
            Block 8, Old Choppies Mall, Gaborone
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {winterBenefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-primary/10">
                  <Droplets className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-[#061a4f]">{benefit}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-xl text-sm font-bold leading-6 text-primary">
            #WinterHydration #FreshWaterMarket #StayFreshWithFWM
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order?service=refill"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-7 text-sm font-extrabold text-white shadow-sm shadow-cyan-900/10 transition-colors hover:bg-[#08466f]"
            >
              Order refills
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/order?service=personalized"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-water/60 bg-white px-7 text-sm font-extrabold text-primary transition hover:border-water hover:bg-cyan-50"
            >
              Custom bottles
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl bg-aqua/70" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-cyan-50 shadow-sm shadow-cyan-900/10">
            <BrandImage
              src="/brand/winter-wellness.jpg"
              fallbackSrc={BRAND_ASSETS.refill}
              alt="Fresh Water Market winter wellness hydration campaign"
              fallbackLabel="Winter wellness starts with water"
              className="aspect-[4/3] w-full"
              width={900}
              height={675}
              sizes="(min-width: 1024px) 560px, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
