"use client";

import { CustomerButton } from "@/components/customer/customer-button";
import { formatCurrency } from "@/lib/utils";

export function OrderCheckoutBar({
  label,
  total,
  quoteLabel,
  disabled,
  onClick
}: {
  label: string;
  total?: number;
  quoteLabel?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const showTotal = quoteLabel || (total != null && total > 0);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-100 bg-white lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-6xl space-y-3 px-4 pt-3 sm:px-6">
        {showTotal ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-muted-foreground">Estimated total</span>
            {quoteLabel ? (
              <span className="text-sm font-bold text-primary">{quoteLabel}</span>
            ) : (
              <span className="text-lg font-extrabold text-primary">{formatCurrency(total!)}</span>
            )}
          </div>
        ) : null}
        <CustomerButton type="button" className="w-full" disabled={disabled} onClick={onClick}>
          {label}
        </CustomerButton>
      </div>
    </div>
  );
}
