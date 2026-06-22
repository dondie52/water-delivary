"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "My delivery driver is amazing. Always on time and always willing to answer questions. Always a great attitude. Thank you!",
    author: "Lynette"
  },
  {
    quote: "Clean store, and the water tastes amazing. Keep it up guys.",
    author: "Merafhe Letlola"
  },
  {
    quote: "Metsi a monate gorrr. Fresh Water Market keeps the water tasting good.",
    author: "Tebogo Dintwe"
  }
];

export function CustomerTestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = testimonials[activeIndex];

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === testimonials.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="relative mx-auto mt-8 max-w-4xl px-12 text-center sm:px-16">
      <button
        type="button"
        onClick={goToPrevious}
        className="focus-ring absolute left-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-cyan-50 text-primary transition hover:border-primary hover:bg-white sm:inline-flex"
        aria-label="Previous customer review"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex justify-center gap-1.5 text-primary" aria-label="5 star review">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-primary" />
        ))}
      </div>

      <blockquote className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-foreground sm:text-xl sm:leading-9">
        {active.quote}
      </blockquote>
      <p className="mt-5 text-sm font-bold text-muted-foreground">— {active.author}</p>

      <button
        type="button"
        onClick={goToNext}
        className="focus-ring absolute right-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-cyan-50 text-primary transition hover:border-primary hover:bg-white sm:inline-flex"
        aria-label="Next customer review"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="mt-7 flex justify-center gap-3 sm:hidden">
        <button
          type="button"
          onClick={goToPrevious}
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-cyan-50 text-primary"
          aria-label="Previous customer review"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={goToNext}
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-cyan-50 text-primary"
          aria-label="Next customer review"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
