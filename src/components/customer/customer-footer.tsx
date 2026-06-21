import Link from "next/link";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { buildPhoneLink } from "@/lib/contact";

const trendingLinks = [
  { label: "Water refill per litre", href: "/order?service=refill" },
  { label: "Student delivery", href: "/order" },
  { label: "Personalized bottle cases", href: "/order?service=personalized" },
  { label: "Ice supply for events", href: "/order?service=ice" },
  { label: "Pickup points", href: "/#pickup" }
];

const footerColumns = [
  { title: "Shop", links: [["Order water", "/order"], ["Popular prices", "/#pricing"], ["Subscriptions", "/subscriptions"]] },
  { title: "Services", links: [["Refills", "/order?service=refill"], ["Bottled water", "/order?service=bottled"], ["Ice supply", "/order?service=ice"]] },
  { title: "Business", links: [["Corporate", "/corporate"], ["Branded bottles", "/order?service=personalized"], ["Track order", "/track"]] },
  { title: "Support", links: [["Contact us", buildPhoneLink()], ["Pickup points", "/#pickup"], ["Assistant", "/assistant"]] }
] as const;

export function CustomerFooter() {
  return (
    <footer className="bg-gradient-to-r from-primary to-[#061a4f] px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.3fr_0.8fr]">
        <div className="grid gap-6 md:grid-cols-2">
          <article>
            <BrandImage
              src={BRAND_ASSETS.brandedBottles}
              alt="Fresh Water Market branded bottles"
              className="aspect-[16/9] w-full rounded-2xl"
              fallbackLabel="Branded bottles"
              width={520}
              height={292}
            />
            <h3 className="mt-4 text-xl font-extrabold">Discover branded water for events</h3>
            <p className="mt-2 text-sm leading-6 text-cyan-50">
              Custom bottles for launches, weddings, sports days, and campus events.
            </p>
          </article>
          <article>
            <BrandImage
              src={BRAND_ASSETS.refill}
              alt="Fresh Water Market refill service"
              className="aspect-[16/9] w-full rounded-2xl"
              fallbackLabel="Water refill"
              width={520}
              height={292}
            />
            <h3 className="mt-4 text-xl font-extrabold">Explore affordable refills</h3>
            <p className="mt-2 text-sm leading-6 text-cyan-50">
              Bring containers, refill affordably, and keep daily hydration simple.
            </p>
          </article>
        </div>
        <div>
          <h3 className="text-xl font-extrabold">Trending</h3>
          <div className="mt-5 space-y-4 text-sm">
            {trendingLinks.map((item) => (
              <Link key={item.label} href={item.href} className="focus-ring block font-semibold text-cyan-50 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 border-t border-white/20 pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4 className="text-sm font-extrabold text-aqua">{column.title}</h4>
            <div className="mt-4 space-y-2 text-sm">
              {column.links.map(([label, href]) => (
                <Link key={label} href={href} className="block text-cyan-50 hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
