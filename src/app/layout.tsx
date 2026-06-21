import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://freshwatermarket.co.bw"),
  title: "Fresh Water Market OS",
  description: "Premium water delivery for Gaborone and campus — refills, bottles, ice, and branded bottles.",
  icons: {
    icon: "/brand/logo.jpg",
    apple: "/brand/logo.jpg"
  },
  openGraph: {
    title: "Fresh Water Market — Gaborone & Campus",
    description: "Order refills, bottled water, ice, and branded bottles with fast pickup or delivery.",
    images: [{ url: "/brand/og-image.jpg", width: 1200, height: 630, alt: "Fresh Water Market" }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Fresh Water Market — Gaborone & Campus",
    description: "Order refills, bottled water, ice, and branded bottles with fast pickup or delivery.",
    images: ["/brand/og-image.jpg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
