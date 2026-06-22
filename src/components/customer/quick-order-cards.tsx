import Link from "next/link";
import { CheckCircle2, MapPin, PackageCheck } from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { ConnectedFlowSteps } from "@/components/customer/connected-flow-steps";
import { CustomerButtonLink } from "@/components/customer/customer-button";
import { getServiceCardsWithPrices } from "@/lib/orders/service-cards";
import type { PriceItem } from "@/modules/catalog/pricing";

const orderFlowSteps = [
  {
    icon: CheckCircle2,
    title: "Choose water",
    body: "Pick refills, bottled water, ice, or branded bottle cases."
  },
  {
    icon: MapPin,
    title: "Set the handoff",
    body: "Choose a pickup point or delivery slot that fits your day."
  },
  {
    icon: PackageCheck,
    title: "Receive your order",
    body: "Fresh Water Market prepares and hands over your water neatly."
  }
];

export function QuickOrderCards({ catalog = [] }: { catalog?: PriceItem[] }) {
  const cards = getServiceCardsWithPrices(catalog);

  return (
    <section id="services" className="bg-white">
      <div className="customer-section">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Order in under a minute
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-primary/80">
              Tap a service, choose pickup or delivery, then confirm with your phone number.
            </p>
          </div>
          <CustomerButtonLink href="/order" className="h-11 px-5 text-sm font-extrabold sm:w-auto">
            Shop all services
          </CustomerButtonLink>
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.type}
                href={`/order?service=${card.type}`}
                className="group customer-card flex min-w-64 flex-col overflow-hidden p-0 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-cyan-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-w-0"
              >
                <div className="relative aspect-[16/10] bg-aqua/50">
                  <BrandImage
                    src={card.image}
                    alt={`${card.title} from Fresh Water Market`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    fallbackLabel={card.title}
                    width={360}
                    height={240}
                    sizes="(min-width: 1024px) 260px, 75vw"
                  />
                  <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary ring-1 ring-cyan-100">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-extrabold leading-6 text-foreground">{card.title}</h3>
                  <p className="mt-1 text-sm text-primary/75">{card.body}</p>
                  <p className="mt-2 text-sm font-bold text-primary">{card.price}</p>
                  <span className="mt-3 text-sm font-extrabold text-primary">Order now &gt;</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-100 bg-aqua/45 p-5 sm:p-6">
          <h3 className="text-base font-extrabold text-foreground">How ordering works</h3>
          <ConnectedFlowSteps steps={orderFlowSteps} className="mt-5" />
        </div>
      </div>
    </section>
  );
}
