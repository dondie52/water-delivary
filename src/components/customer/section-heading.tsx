import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  className,
  align = "center"
}: {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      <span
        aria-hidden="true"
        className={cn(
          "mt-3 block h-0.5 w-14 rounded-full bg-gradient-to-r from-water to-teal-brand",
          align === "center" ? "mx-auto" : ""
        )}
      />
      {subtitle ? <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
