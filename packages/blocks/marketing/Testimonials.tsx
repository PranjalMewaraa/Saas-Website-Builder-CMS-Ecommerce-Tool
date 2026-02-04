import React from "react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

interface TestimonialsV1Props {
  title?: string;
  testimonials?: Testimonial[];
  contentWidth?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    quote:
      "This product completely changed how we approach our workflow. Highly recommended!",
    name: "Sarah Chen",
    role: "Product Designer at TechCorp",
  },
  {
    quote: "The best investment we've made this year. Support is outstanding.",
    name: "Michael Reyes",
    role: "CTO at StartupX",
  },
  {
    quote: "Intuitive, fast, and reliable. Exactly what we needed.",
    name: "Priya Sharma",
    role: "Marketing Lead at Growthify",
  },
];

export default function TestimonialsV1({
  title,
  contentWidth,
  testimonials = defaultTestimonials,
}: TestimonialsV1Props) {
  const maxWidth =
    contentWidth === "sm"
      ? "640px"
      : contentWidth === "md"
        ? "768px"
        : contentWidth === "lg"
          ? "1024px"
          : contentWidth === "xl"
            ? "1280px"
            : contentWidth === "2xl"
              ? "1536px"
              : "1280px";
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto px-6" style={{ maxWidth: maxWidth }}>
        {title && (
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Trusted by teams shipping great experiences.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
            >
              <div className="text-4xl leading-none text-slate-300">“</div>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                {t.quote}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
