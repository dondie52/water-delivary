import Link from "next/link";
import { ArrowRight, Droplets, Mail, MapPin, Package, Recycle, Sparkles, Truck } from "lucide-react";
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

export function LowerLandingSections() {
  return (
    <>
      <section className="bg-cyan-50 px-4 py-14 text-[#061a4f] sm:px-6 sm:py-16 lg:px-8">
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
            See Why Our Water Delivery Customers Love Us
          </h2>
          <CustomerTestimonialCarousel />
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-white text-white">
        <div className="absolute left-0 right-0 top-0 z-10 h-24 bg-white [clip-path:ellipse(74%_62%_at_50%_0%)]" aria-hidden="true" />
        <BrandImage
          src={BRAND_ASSETS.heroBanner}
          alt="Fresh Water Market water supply for homes, campus, and events"
          className="absolute inset-0 h-full w-full"
          fallbackLabel="Fresh Water Market"
          width={1400}
          height={720}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#061a4f]/72" aria-hidden="true" />
        <div className="relative z-20 mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-aqua sm:text-5xl">
            Hydrating a Healthy Gaborone
          </h2>
          <h3 className="mt-28 text-center text-2xl font-extrabold text-white">
            Environmental and Community Responsibility
          </h3>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Recycle, value: "Refill-first", body: "Reusable containers reduce single-use plastic for everyday water." },
              { icon: Truck, value: "Campus routes", body: "Delivery and pickup built around student schedules and locations." },
              { icon: Sparkles, value: "Event ready", body: "Branded bottles support launches, weddings, sport days, and teams." },
              { icon: MapPin, value: "Local service", body: "Gaborone-based support with clear pricing and simple ordering." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.value} className="flex gap-3">
                  <Icon className="mt-1 h-9 w-9 shrink-0 text-aqua" />
                  <div>
                    <p className="text-sm font-extrabold text-white">{item.value}</p>
                    <p className="mt-1 text-sm leading-6 text-cyan-50">{item.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-cyan-50 px-4 py-16 text-[#061a4f] sm:px-6 lg:px-8">
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

      <section className="bg-cyan-50 px-4 pb-16 pt-4 text-[#061a4f] sm:px-6 lg:px-8">
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
                    <span className="flex items-center gap-2 text-sm font-extrabold tracking-[0.18em] text-primary">
                      {item.title}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-[#061a4f]">{item.body}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-9 flex flex-col gap-6 border-t border-cyan-100 pt-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Mail className="h-12 w-12 text-primary" />
              <div>
                <h3 className="text-2xl font-extrabold">Still thirsty? Stay in the know.</h3>
                <p className="mt-1 text-sm text-primary/75">Get Fresh Water Market updates, refill reminders, and offers.</p>
              </div>
            </div>
            <form className="flex w-full max-w-sm rounded-full border border-primary bg-white p-1" action="#" aria-label="Newsletter signup">
              <input
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 rounded-full px-4 text-sm outline-none placeholder:text-primary/70"
                aria-label="Email address"
              />
              <button type="submit" className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white" aria-label="Submit email">
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
