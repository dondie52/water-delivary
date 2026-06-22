import type { WizardStep } from "@/lib/orders/order-wizard";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { CustomerAccountActions } from "@/components/customer/customer-account-actions";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

const FLOW_STEPS: { key: WizardStep; label: string }[] = [
  { key: "product", label: "Choose Your Water" },
  { key: "fulfillment", label: "Pickup or Delivery" },
  { key: "contact", label: "Your Details" }
];

function stepIndex(step: WizardStep): number {
  if (step === "confirm") return FLOW_STEPS.length;
  const index = FLOW_STEPS.findIndex((item) => item.key === step);
  return index >= 0 ? index : 0;
}

function stepLabel(step: WizardStep): string {
  if (step === "confirm") return "Confirm your order";
  return FLOW_STEPS.find((item) => item.key === step)?.label ?? "Choose Your Water";
}

export function OrderFlowHeader({ currentStep }: { currentStep: WizardStep }) {
  const activeIndex = stepIndex(currentStep);
  const activeLabel = stepLabel(currentStep);
  const stepNumber = currentStep === "confirm" ? FLOW_STEPS.length : activeIndex + 1;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
          <Link href="/" className="focus-ring shrink-0 rounded-lg" aria-label="Fresh Water Market home">
            <BrandImage
              src={BRAND_ASSETS.logo}
              alt="Fresh Water Market"
              fit="contain"
              className="h-8 w-auto max-w-[120px] object-contain sm:h-9 sm:max-w-[140px]"
              fallbackLabel="Fresh Water Market"
              width={400}
              height={120}
              priority
            />
          </Link>

          <div className="hidden items-center gap-1.5 text-sm font-semibold text-foreground sm:flex">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">Campus</span>
            <span>Gaborone</span>
          </div>

          <CustomerAccountActions
            loginClassName="border border-slate-200 bg-white text-primary"
            iconClassName="border border-slate-200 bg-white text-primary"
          />
        </div>

        <div className="flex flex-col items-center gap-2 pb-3 sm:pb-4">
          <p className="truncate text-center text-sm font-semibold text-foreground" aria-current="step">
            {activeLabel}
          </p>
          <p className="sr-only">
            Step {stepNumber} of {FLOW_STEPS.length}
            {currentStep === "confirm" ? ", review" : ""}
          </p>
          <div className="flex items-center gap-2" role="list" aria-label="Order progress">
            {FLOW_STEPS.map((item, index) => (
              <span
                key={item.key}
                role="listitem"
                aria-label={`${item.label}${index < activeIndex ? ", completed" : index === activeIndex && currentStep !== "confirm" ? ", current" : ""}`}
                className={cn(
                  "h-2.5 w-2.5 rounded-full border transition-colors",
                  index < activeIndex || (currentStep === "confirm" && index === FLOW_STEPS.length - 1)
                    ? "border-primary bg-primary"
                    : index === activeIndex && currentStep !== "confirm"
                      ? "border-primary bg-primary"
                      : "border-slate-300 bg-white"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
