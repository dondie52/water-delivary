/**
 * Brand image paths under /public/brand/.
 * BrandImage falls back to gradients when files are missing.
 */
export const BRAND_ASSETS = {
  logo: "/brand/logo.jpg",
  logoDark: "/brand/logo.jpg",
  heroBanner: "/brand/hero-banner.jpg",
  refill: "/brand/refill.jpg",
  bottles: "/brand/bottles.jpg",
  personalizedBottles: "/brand/personalized-bottles.jpg",
  brandedBottles: "/brand/branded-bottles.jpg",
  ice: "/brand/ice.jpg",
  ogImage: "/brand/og-image.jpg",
  deliveryDemo: "/brand/delivery-demo.mp4",
  categories: {
    refill: "/brand/categories/refill.png",
    bottled: "/brand/categories/bottled.png",
    branded: "/brand/categories/branded.png",
    ice: "/brand/categories/ice.png",
    delivery: "/brand/categories/delivery.png",
    pickup: "/brand/categories/pickup.png",
    corporate: "/brand/categories/corporate.png"
  }
} as const;
