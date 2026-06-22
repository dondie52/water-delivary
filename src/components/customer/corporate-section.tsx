import { Sparkles } from "lucide-react";
import { CustomerButtonLink } from "@/components/customer/customer-button";

export function CorporateBanner() {
  return (
    <section id="corporate" className="border-y border-cyan-100 bg-white px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-aqua text-primary ring-1 ring-cyan-100 sm:mt-0">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-foreground sm:text-base">Branded bottles for events &amp; teams</p>
            <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
              Custom labels from P144 per case — weddings, sports days, and campus events.
            </p>
          </div>
        </div>
        <CustomerButtonLink href="/corporate" variant="outline" className="h-10 shrink-0 px-5 text-sm">
          Request a quote
        </CustomerButtonLink>
      </div>
    </section>
  );
}
