import Link from "next/link";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";

const useCases = ["Events", "Corporates", "Weddings", "Sports teams", "Student orgs"];

export function CorporateSection() {
  return (
    <section id="corporate" className="water-tint">
      <div className="customer-section w-full">
        <div className="surface grid items-center gap-8 p-5 sm:p-7 lg:grid-cols-2 lg:gap-10">
          <div className="relative order-2 lg:order-1">
            <BrandImage
              src={BRAND_ASSETS.personalizedBottles}
              alt="Personalized Fresh Water Market bottles"
              className="aspect-[4/3] w-full rounded-2xl"
              fallbackLabel="Personalized bottles"
              width={640}
              height={480}
              sizes="(min-width: 1024px) 480px, 100vw"
            />
            <span className="absolute -bottom-3 left-4 rounded-xl bg-secondary px-3 py-1.5 text-sm font-black text-[#061a4f] shadow-sm shadow-cyan-900/10">
              Your logo, our water
            </span>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
              Branded bottles for events and teams.
            </h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-primary/80">
              Custom-labelled water for launches, weddings, sports days, and campus events. From P144 per case of 24.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {useCases.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-cyan-50 px-3.5 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/10"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/corporate"
                className="focus-ring inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-base font-bold text-white shadow-sm shadow-cyan-900/10 transition-colors hover:bg-[#08466f]"
              >
                Request a quote
              </Link>
              <Link
                href="/order?service=personalized"
                className="focus-ring inline-flex h-12 items-center justify-center rounded-2xl border border-primary/25 bg-white px-7 text-base font-bold text-primary transition-colors hover:border-primary hover:bg-aqua/45"
              >
                Order branded bottles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
