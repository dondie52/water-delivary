import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/customer/section-heading";

export function PickupDeliverySection({
  pickupLocations,
  deliverySlots,
  deliveryFee
}: {
  pickupLocations: string[];
  deliverySlots: string[];
  deliveryFee: number;
}) {
  return (
    <section id="pickup">
      <div className="customer-section w-full">
        <SectionHeading align="left" title="Pickup & delivery" subtitle="Collect free around campus, or get it delivered." />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="surface p-5">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <h3 className="text-base font-bold">Pickup points</h3>
              <span className="ml-auto text-xs font-bold text-primary/70">Free</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {pickupLocations.map((location) => (
                <span
                  key={location}
                  className="inline-flex items-center rounded-full bg-aqua/55 px-3.5 py-2 text-sm font-semibold text-primary ring-1 ring-primary/10"
                >
                  {location}
                </span>
              ))}
            </div>
          </article>

          <article className="surface p-5">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              <h3 className="text-base font-bold">Delivery slots</h3>
              <span className="ml-auto rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-black text-secondary">
                Student delivery from P{deliveryFee}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {deliverySlots.map((slot) => (
                <span
                  key={slot}
                  className="inline-flex items-center rounded-full bg-aqua/55 px-3.5 py-2 text-sm font-semibold text-primary ring-1 ring-primary/10"
                >
                  {slot}
                </span>
              ))}
            </div>
          </article>
        </div>

        <Link
          href="/order"
          className="focus-ring mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-base font-bold text-white shadow-sm shadow-cyan-900/10 transition-colors hover:bg-[#08466f]"
        >
          Start your order
        </Link>
      </div>
    </section>
  );
}
