import { CheckCircle2 } from "lucide-react";
import type { ServiceType } from "@/lib/orders/order-wizard";
import { getServiceCardsWithPrices } from "@/lib/orders/service-cards";
import { SelectableTile } from "@/components/order/wizard/quantity-stepper";
import { BrandImage } from "@/components/customer/brand-image";
import type { PriceItem } from "@/modules/catalog/pricing";

export function StepService({
  selected,
  catalog,
  onSelect
}: {
  selected: ServiceType | null;
  catalog?: PriceItem[];
  onSelect: (service: ServiceType) => void;
}) {
  const services = getServiceCardsWithPrices(catalog ?? []);

  return (
    <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const Icon = service.icon;
        const isSelected = selected === service.type;

        return (
          <SelectableTile
            key={service.type}
            selected={isSelected}
            onClick={() => onSelect(service.type)}
            className="group overflow-hidden p-0"
          >
            <div className="flex h-full min-h-56 flex-col">
              <div className="relative aspect-[16/10] overflow-hidden bg-aqua/45">
                <BrandImage
                  src={service.image}
                  alt={`${service.title} service`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  fallbackLabel={service.title}
                  width={360}
                  height={220}
                  sizes="(min-width: 640px) 280px, 100vw"
                />
                <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-cyan-900/5 ring-1 ring-cyan-100">
                  <Icon className="h-5 w-5" />
                </span>
                {isSelected ? (
                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-bold leading-5 text-[#061a4f]">{service.title}</p>
                <p className="mt-1 text-sm leading-5 text-primary/75">{service.body}</p>
                <p className="mt-auto pt-3 text-sm font-extrabold text-primary">{service.price}</p>
              </div>
            </div>
          </SelectableTile>
        );
      })}
    </div>
  );
}
