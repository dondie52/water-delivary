import Link from "next/link";
import { ArrowRight, Droplets, Package, Truck } from "lucide-react";
import { BrandImage } from "@/components/customer/brand-image";
import { CustomerTestimonialCarousel } from "@/components/customer/customer-testimonial-carousel";
import { BRAND_ASSETS } from "@/lib/brand-assets";

const faqs = [
  {
    question: "How fast can I get water delivered?",
    answer: "Student delivery is available during listed delivery slots. Pickup is usually the quickest option when you are already on campus."
  },
  {
    question: "Can I order refills and bottled water together?",
    answer: "Yes. Start an order, choose your service, and add notes if you need a mixed order or a special request."
  },
  {
    question: "Where are the pickup points?",
    answer: "Fresh Water Market supports campus pickup points such as Vegas Parking Lot, UB Clinic Parking, 475 Parking Lot, and Block 470 Parking Lot."
  },
  {
    question: "Do you supply branded bottles for events?",
    answer: "Yes. Corporate, wedding, team, and campus-event branded bottles can be requested through the corporate quote flow."
  }
];

const helpLinks = [
  {
    href: "/order",
    icon: Truck,
    title: "Get delivery",
    body: "Fresh water delivered to your campus location or nearby address."
  },
  {
    href: "/order?service=refill",
    icon: Droplets,
    title: "Water refill",
    body: "Bring your own containers and refill from P1.60 per litre."
  },
  {
    href: "/track",
    icon: Package,
    title: "Track order",
    body: "Look up your order status with your phone number or order code."
  }
];

const communityProof = [
  "Refill-first delivery across campus pickup points and student routes.",
  "Gaborone-based support with clear pricing — reach us on WhatsApp anytime."
];

export function LowerLandingSections() {
  return (
    <>
      <section className="bg-cyan-50 px-4 py-14 text-foreground sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <BrandImage
            src={BRAND_ASSETS.logo}
            alt="Fresh Water Market logo"
            fit="contain"
            className="mx-auto h-14 w-auto max-w-[200px] object-contain"
            fallbackLabel="Fresh Water Market"
            width={400}
            height={120}
          />
          <h2 className="mx-auto mt-5 max-w-3xl text-2xl font-extrabold tracking-tight sm:text-3xl">
            Trusted on campus &amp; across Gaborone
          </h2>
          <CustomerTestimonialCarousel />
        </div>
      </section>

      <section className="bg-aqua/45 px-4 py-16 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Hydrating a healthy Gaborone
            </h2>
            <p className="mt-4 text-base leading-7 text-primary/80">
              Environmental and community responsibility built into how we deliver water.
            </p>
            <ul className="mt-6 space-y-3">
              {communityProof.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-6 text-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-water" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <BrandImage
            src={BRAND_ASSETS.heroBanner}
            alt="Fresh Water Market water supply for homes, campus, and events"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
            fallbackLabel="Fresh Water Market"
            width={1400}
            height={720}
            sizes="(min-width: 1024px) 520px, 100vw"
          />
        </div>
      </section>

      <section className="bg-cyan-50 px-4 py-16 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <div className="mt-10 divide-y divide-primary/25">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold">
                  {faq.question}
                  <span className="text-2xl leading-none text-primary group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-primary/80">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cyan-50 px-4 pb-16 pt-4 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm shadow-cyan-900/10 sm:p-8">
          <h2 className="text-center text-2xl font-extrabold tracking-tight">What can we help you find today?</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {helpLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="focus-ring group flex gap-4 rounded-xl p-2 transition-colors hover:bg-cyan-50">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="flex items-center gap-2 text-sm font-extrabold text-primary">
                      {item.title}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-foreground">{item.body}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
