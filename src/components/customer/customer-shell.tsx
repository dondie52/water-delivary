import { CustomerHeader } from "@/components/customer/customer-header";
import { CustomerFooter } from "@/components/customer/customer-footer";
import { FloatingAssistantButton } from "@/components/customer/floating-assistant-button";
import { cn } from "@/lib/utils";

export function CustomerShell({
  children,
  className,
  showAssistant = true,
  compactFooter = false
}: {
  children: React.ReactNode;
  className?: string;
  showAssistant?: boolean;
  compactFooter?: boolean;
}) {
  return (
    <div
      className={cn(
        "water-canvas min-h-screen overflow-x-hidden text-foreground",
        compactFooter ? "pb-6" : "pb-28 sm:pb-20",
        className
      )}
    >
      <CustomerHeader />
      {children}
      <CustomerFooter />
      {showAssistant ? <FloatingAssistantButton /> : null}
    </div>
  );
}
