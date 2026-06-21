import { WIZARD_STEPS, type WizardStep } from "@/lib/orders/order-wizard";
import { cn } from "@/lib/utils";

const VISIBLE_STEPS = WIZARD_STEPS.filter((step) => step !== "confirm");

const labels: Record<WizardStep, string> = {
  service: "Service",
  product: "Product",
  fulfillment: "Pickup/Delivery",
  contact: "Phone",
  confirm: "Review"
};

export function WizardProgressBar({ currentStep }: { currentStep: WizardStep }) {
  const currentIndex = VISIBLE_STEPS.indexOf(currentStep === "confirm" ? "contact" : currentStep);

  return (
    <div className="mb-5 rounded-2xl border border-cyan-100 bg-white p-3 shadow-sm shadow-cyan-900/5">
      <div className="flex items-center justify-between gap-1">
        {VISIBLE_STEPS.map((step, index) => (
          <div key={step} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                index <= currentIndex ? "bg-primary text-white" : "bg-aqua/55 text-primary/55"
              )}
            >
              {index + 1}
            </div>
            <span className={cn("hidden text-[10px] font-semibold sm:block", index === currentIndex ? "text-primary" : "text-primary/55")}>{labels[step]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-aqua/55">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((currentIndex + 1) / VISIBLE_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
