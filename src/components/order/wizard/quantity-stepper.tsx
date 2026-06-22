import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-cyan-100 bg-aqua/40 p-1">
      <button
        type="button"
        className="focus-ring flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-cyan-900/5 disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-5 w-5" />
      </button>
      <span className="min-w-[2.5rem] text-center text-xl font-black text-foreground">{value}</span>
      <button
        type="button"
        className="focus-ring flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-sm disabled:opacity-40"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

export function SelectableTile({
  selected,
  onClick,
  children,
  className
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring w-full rounded-2xl bg-white p-4 text-left shadow-sm shadow-cyan-900/5 ring-1 ring-cyan-100 transition-[background-color,border-color,box-shadow,transform] duration-200",
        selected
          ? "bg-aqua/55 ring-2 ring-primary/40"
          : "customer-card-interactive hover:bg-aqua/35",
        className
      )}
    >
      {children}
    </button>
  );
}
