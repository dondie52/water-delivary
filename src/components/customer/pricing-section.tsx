import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { CustomerButtonLink } from "@/components/customer/customer-button";
import { BRAND_ASSETS } from "@/lib/brand-assets";

export type PopularPrice = {
  name: string;
  price: string;
  href: string;
  popular?: boolean;
};

const featuredImages = [BRAND_ASSETS.refill, BRAND_ASSETS.bottles, BRAND_ASSETS.brandedBottles];

export function PricingSection({ prices }: { prices: PopularPrice[] }) {
  const featured = prices.slice(0, 3);
  const rest = prices.slice(3);

  return (
    <section id="pricing" className="bg-aqua/45">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Popular prices</h2>
            <p className="mt-2 text-base leading-7 text-primary/80">Clear prices for students, teams, and households.</p>
          </div>
          <CustomerButtonLink href="/order" className="h-10 px-5 text-sm font-extrabold sm:w-auto">
            Start order
          </CustomerButtonLink>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {featured.map((item, index) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-cyan-100 bg-white transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[16/10] bg-cyan-50">
                  {item.popular ? (
                    <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                      Most popular
                    </span>
                  ) : null}
                  <BrandImage
                    src={featuredImages[index % featuredImages.length]}
                    alt={`${item.name} from Fresh Water Market`}
                    className="h-full w-full object-cover"
                    fallbackLabel={item.name}
                    width={360}
                    height={220}
                    sizes="(min-width: 1024px) 320px, 90vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-extrabold leading-5 text-foreground">{item.name}</h3>
                  <p className="mt-2 text-lg font-extrabold text-primary">{item.price}</p>
                  <span className="mt-3 text-sm font-extrabold text-primary group-hover:underline">Order now →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {rest.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-cyan-100 bg-white">
            <ul className="divide-y divide-cyan-100">
              {rest.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="focus-ring flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-aqua/30 sm:px-5"
                  >
                    <span className="text-sm font-semibold text-foreground">{item.name}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-primary">{item.price}</span>
                      <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
