import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, PackageCheck, Truck } from "lucide-react";

const deliverySteps = [
  {
    icon: CheckCircle2,
    title: "Choose water",
    body: "Pick refills, bottled water, ice, or branded bottle cases."
  },
  {
    icon: MapPin,
    title: "Set the handoff",
    body: "Choose a pickup point or delivery slot that fits your day."
  },
  {
    icon: PackageCheck,
    title: "Receive your order",
    body: "Fresh Water Market prepares and hands over your water neatly."
  }
];

export function DeliveryDemoSection() {
  return (
    <section className="bg-white px-4 py-16 text-[#061a4f] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-[#061a4f] sm:text-4xl">
            See Fresh Water Market delivery in action
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-primary/80">
            From everyday campus refills to bottled water for home or events, the flow stays simple:
            order, choose the handoff, and receive fresh water without the runaround.
          </p>

          <div className="mt-7 grid gap-4">
            {deliverySteps.map((step) => {
              const Icon = step.icon;

              return (
                <article key={step.title} className="flex gap-4 rounded-2xl border border-cyan-100 bg-cyan-50/55 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-primary/10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-primary/75">{step.body}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-7 text-sm font-extrabold text-white shadow-sm shadow-cyan-900/10 transition-colors hover:bg-[#08466f]"
            >
              Start your order
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/track"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-water/60 bg-white px-7 text-sm font-extrabold text-primary transition hover:border-water hover:bg-cyan-50"
            >
              Track delivery
              <Truck className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
