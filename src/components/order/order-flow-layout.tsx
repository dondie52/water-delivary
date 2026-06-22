import type { ReactNode } from "react";
import { BrandImage } from "@/components/customer/brand-image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { OrderFlowFooter } from "@/components/order/order-flow-footer";
import { OrderFlowHeader } from "@/components/order/order-flow-header";
import type { WizardStep } from "@/lib/orders/order-wizard";

export function OrderFlowLayout({
  currentStep,
  heroImage = BRAND_ASSETS.heroBanner,
  heroAlt = "Fresh water delivery",
  mobileCheckoutBar,
  children
}: {
  currentStep: WizardStep;
  heroImage?: string;
  heroAlt?: string;
  mobileCheckoutBar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="water-canvas flex min-h-dvh flex-col text-foreground">
      <OrderFlowHeader currentStep={currentStep} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row">
        <aside className="relative hidden w-full shrink-0 lg:block lg:min-h-0 lg:w-1/2">
          <BrandImage
            src={heroImage}
            alt={heroAlt}
            className="absolute inset-0 h-full w-full object-cover"
            fallbackLabel="Fresh water delivery"
            width={960}
            height={1200}
            sizes="50vw"
            priority
          />
        </aside>
        <main
          className={
            mobileCheckoutBar
              ? "flex w-full flex-1 flex-col px-4 py-6 pb-28 sm:px-8 sm:py-10 lg:w-1/2 lg:pb-10"
              : "flex w-full flex-1 flex-col px-4 py-6 sm:px-8 sm:py-10 lg:w-1/2 lg:pb-10"
          }
        >
          <div className="relative -mx-4 mb-5 aspect-[21/9] overflow-hidden sm:-mx-8 lg:hidden">
            <BrandImage
              src={heroImage}
              alt={heroAlt}
              className="h-full w-full object-cover"
              fallbackLabel="Fresh water delivery"
              width={800}
              height={340}
              sizes="100vw"
            />
          </div>
          {children}
        </main>
      </div>
      {mobileCheckoutBar}
      <OrderFlowFooter />
    </div>
  );
}
