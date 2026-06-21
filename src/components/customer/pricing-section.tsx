import Link from "next/link";
import { Package } from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";

export type PopularPrice = {
  name: string;
  price: string;
  href: string;
  popular?: boolean;
};

const productImages = [
  BRAND_ASSETS.refill,
  BRAND_ASSETS.bottles,
  BRAND_ASSETS.brandedBottles,
  BRAND_ASSETS.personalizedBottles,
  BRAND_ASSETS.ice,
  BRAND_ASSETS.heroBanner
];

export function PricingSection({ prices }: { prices: PopularPrice[] }) {
  return (
    <section id="pricing" className="bg-aqua/45">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#061a4f] sm:text-3xl">Popular prices</h2>
            <p className="mt-2 text-base leading-7 text-primary/80">Clear prices for students, teams, and households.</p>
          </div>
          <Link href="/order" className="focus-ring text-sm font-extrabold text-primary underline-offset-4 hover:underline">
            Start order
          </Link>
        </div>

        <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-6">
          {prices.map((item, index) => (
            <li key={item.name} className="min-w-56 sm:min-w-0">
              <Link
                href={item.href}
                className="group flex h-full min-h-64 flex-col rounded-2xl border border-cyan-100 bg-white p-3 text-[#061a4f] shadow-sm shadow-cyan-900/5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-cyan-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="flex h-28 items-center justify-center rounded-xl bg-cyan-50">
                  <BrandImage
                    src={productImages[index % productImages.length]}
                    alt={`${item.name} from Fresh Water Market`}
                    className="h-full w-full rounded-xl"
                    fallbackLabel={item.name}
                    width={260}
                    height={180}
                    sizes="224px"
                  />
                </div>
                <div className="flex flex-1 flex-col px-1 pt-4">
                  <h3 className="line-clamp-3 text-sm font-bold leading-5">{item.name}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary/70">
                    <Package className="h-3.5 w-3.5" />
                    Fresh Water Market
                  </p>
                  <p className="mt-3 text-base font-extrabold text-primary">{item.price}</p>
                  <span className="mt-auto inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-extrabold text-white transition-colors group-hover:bg-[#08466f]">
                    Order
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
