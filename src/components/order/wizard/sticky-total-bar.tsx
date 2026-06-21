import { formatCurrency } from "@/lib/utils";

export function StickyTotalBar({
  total,
  label = "Estimated total",
  quoteLabel
}: {
  total: number;
  label?: string;
  quoteLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 -mx-4 border-t border-cyan-100 bg-white px-4 py-3 shadow-[0_-8px_18px_rgba(15,23,42,0.04)] sm:-mx-6 sm:px-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary/75">{label}</span>
        {quoteLabel ? (
          <span className="text-sm font-bold text-primary">{quoteLabel}</span>
        ) : (
          <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
        )}
      </div>
    </div>
  );
}
