import { createAdminClient } from "@/lib/supabase/admin";
import { loadCatalogProducts } from "@/lib/catalog/load-catalog-products";
import { loadPilotSettings } from "@/lib/settings/load-pilot-settings";
import { deliverySlots, pickupLocations, priceBook } from "@/modules/catalog/pricing";
import { defaultPilotSettings } from "@/modules/settings/pilot-settings";
import { CustomerShell } from "@/components/customer/customer-shell";
import { HeroSection } from "@/components/customer/hero-section";
import { QuickOrderCards } from "@/components/customer/quick-order-cards";
import { WinterHydrationSection } from "@/components/customer/winter-hydration-section";
import { PricingSection, type PopularPrice } from "@/components/customer/pricing-section";
import { PickupDeliverySection } from "@/components/customer/pickup-delivery-section";
import { LowerLandingSections } from "@/components/customer/lower-landing-sections";
import { CorporateBanner } from "@/components/customer/corporate-section";
import { FinalCtaSection } from "@/components/customer/final-cta-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fresh Water Market — Water Delivery Across Campus & Gaborone",
  description:
    "Order water refills, bottled water, ice, and branded bottles. Pickup around campus or student delivery from P30. Contact us for help."
};

function buildPopularPrices(
  catalog: Awaited<ReturnType<typeof loadCatalogProducts>>,
  studentDeliveryFee: number
): PopularPrice[] {
  const source = catalog.length > 0 ? catalog : priceBook;
  const find = (sku: string) => source.find((item) => item.sku === sku);
  const refill = source.find((item) => item.category === "refill");
  const fmt = (value?: number) => (value != null ? `P${value % 1 === 0 ? value : value.toFixed(2)}` : "—");

  return [
    {
      name: "Water refill (per litre)",
      price: refill ? `P${refill.price.toFixed(2)}/L` : "P1.60/L",
      href: "/order?service=refill",
      popular: true
    },
    { name: "500ml bottle", price: fmt(find("FWM-BW-500")?.price ?? 5), href: "/order?service=bottled" },
    { name: "5L bottle", price: fmt(find("FWM-BW-5000")?.price ?? 20), href: "/order?service=bottled" },
    { name: "Standard case 500ml ×24", price: fmt(find("FWM-CASE-500-24")?.price ?? 120), href: "/order?service=bottled" },
    { name: "Personalized 500ml ×24", price: fmt(find("FWM-PW-500-24")?.price ?? 144), href: "/order?service=personalized" },
    { name: "Student delivery", price: fmt(studentDeliveryFee), href: "/order" }
  ];
}

export default async function Home() {
  const supabase = createAdminClient();
  const settings = supabase ? await loadPilotSettings(supabase) : defaultPilotSettings;
  const catalog = await loadCatalogProducts(false);
  const popularPrices = buildPopularPrices(catalog, settings.studentDeliveryFee);

  return (
    <CustomerShell>
      <main>
        <HeroSection whatsappNumber={settings.whatsappNumber} catalog={catalog} />
        <QuickOrderCards catalog={catalog} />
        <WinterHydrationSection />
        <PricingSection prices={popularPrices} />
        <PickupDeliverySection
          pickupLocations={pickupLocations}
          deliverySlots={deliverySlots.map((slot) => slot.label)}
          deliveryFee={settings.studentDeliveryFee}
        />
        <LowerLandingSections />
        <CorporateBanner />
        <FinalCtaSection whatsappNumber={settings.whatsappNumber} />
      </main>
    </CustomerShell>
  );
}
