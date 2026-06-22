import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const ORDER_FLOW_STEPS = [
  { key: "pending", label: "Received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "completed", label: "Delivered" }
] as const;

export type OrderFlowStepKey = (typeof ORDER_FLOW_STEPS)[number]["key"];

function stepIndex(status: string) {
  if (status === "cancelled") return -1;
  const index = ORDER_FLOW_STEPS.findIndex((step) => step.key === status);
  return index >= 0 ? index : 0;
}

type OrderStatusStepperProps = {
  status: string;
  className?: string;
  compact?: boolean;
};

export function OrderStatusStepper({ status, className, compact = false }: OrderStatusStepperProps) {
  const currentIndex = stepIndex(status);
  const cancelled = status === "cancelled";

  if (cancelled) {
    return (
      <div className={cn("rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700", className)}>
        Order cancelled
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} role="list" aria-label="Order progress">
      <ol
        className={cn(
          "flex",
          compact
            ? "flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            : "flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        )}
      >
        {ORDER_FLOW_STEPS.map((step, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;
          const upcoming = index > currentIndex;

          return (
            <li
              key={step.key}
              role="listitem"
              className={cn(
                "relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center",
                !compact && "sm:gap-2"
              )}
            >
              {index < ORDER_FLOW_STEPS.length - 1 ? (
                <span
                  className={cn(
                    "absolute hidden sm:block",
                    compact ? "left-[calc(50%+1rem)] top-4 h-0.5 w-[calc(100%-2rem)]" : "left-[calc(50%+1.25rem)] top-5 h-0.5 w-[calc(100%-2.5rem)]",
                    completed ? "bg-accent" : "bg-cyan-100"
                  )}
                  aria-hidden="true"
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex shrink-0 items-center justify-center rounded-full font-bold",
                  compact ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm",
                  completed && "bg-accent text-white",
                  active && "bg-primary text-white ring-4 ring-primary/15",
                  upcoming && "bg-cyan-50 text-muted-foreground ring-1 ring-cyan-100"
                )}
                aria-current={active ? "step" : undefined}
              >
                {completed ? <Check className={compact ? "h-4 w-4" : "h-5 w-5"} /> : index + 1}
              </span>

              <span
                className={cn(
                  "min-w-0 pt-0.5 text-sm font-semibold sm:pt-0",
                  active ? "text-primary" : completed ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
