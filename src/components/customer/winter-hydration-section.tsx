import { MapPin, Snowflake } from "lucide-react";
import { CustomerButtonLink } from "@/components/customer/customer-button";

export function WinterHydrationSection() {
  return (
    <section className="border-y border-cyan-100 bg-aqua/45 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-water ring-1 ring-cyan-100 sm:mt-0">
            <Snowflake className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm leading-6 text-foreground sm:text-base">
            <span className="font-extrabold">Winter hydration</span> — keep refilled this season. Visit us at{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Block 8, Old Choppies Mall
            </span>
            .
          </p>
        </div>
        <CustomerButtonLink href="/order?service=refill" className="h-10 shrink-0 px-5 text-sm">
          Order refills
        </CustomerButtonLink>
      </div>
    </section>
  );
}
