import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "contact" | "whatsapp" | "inverse" | "inverse-outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm shadow-cyan-900/10 hover:bg-primary-hover disabled:shadow-none",
  secondary: "bg-water text-white shadow-sm shadow-cyan-900/10 hover:bg-teal-brand disabled:shadow-none",
  outline: "border border-primary/25 bg-white text-primary hover:border-primary hover:bg-aqua/45",
  contact: "border border-primary/25 bg-white text-primary hover:border-primary hover:bg-aqua/45",
  whatsapp: "bg-[#059669] text-white shadow-sm hover:bg-[#047857]",
  inverse: "bg-white text-primary shadow-sm shadow-cyan-900/10 hover:bg-aqua disabled:shadow-none",
  "inverse-outline":
    "border border-white/55 bg-transparent text-white hover:border-white hover:bg-white/10 disabled:shadow-none"
};

const baseClass =
  "focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-55";

type BaseProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function CustomerButton({
  variant = "primary",
  className,
  children,
  ...props
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function CustomerButtonLink({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: BaseProps & React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}

export function CustomerExternalLink({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </a>
  );
}
