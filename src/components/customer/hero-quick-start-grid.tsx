import Link from "next/link";
import { BrandImage } from "@/components/customer/brand-image";
import { getServiceCardsWithPrices } from "@/lib/orders/service-cards";
import type { PriceItem } from "@/modules/catalog/pricing";

export function HeroQuickStartGrid({ catalog = [] }: { catalog?: PriceItem[] }) {
  const cards = getServiceCardsWithPrices(catalog);

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link
            key={card.type}
            href={`/order?service=${card.type}`}
            className="group customer-card customer-card-interactive flex flex-col overflow-hidden p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative aspect-[16/10] bg-aqua/50">
              {card.type === "refill" ? (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                  Most popular
                </span>
              ) : null}
              <BrandImage
                src={card.image}
                alt={`${card.title} from Fresh Water Market`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                fallbackLabel={card.title}
                width={360}
                height={220}
                sizes="(min-width: 1024px) 240px, 50vw"
              />
              <span className="absolute left-2 bottom-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary ring-1 ring-cyan-100">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <div className="flex flex-1 flex-col p-3">
              <h3 className="text-sm font-extrabold leading-5 text-foreground">{card.title}</h3>
              <p className="mt-1 text-xs font-bold text-primary">{card.price}</p>
              <span className="mt-2 text-xs font-extrabold text-primary group-hover:underline">Order now →</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
