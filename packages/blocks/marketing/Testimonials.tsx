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
      <div className=" mx-auto px-6" style={{ maxWidth: maxWidth }}>
        {title && (
          <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="border rounded-xl p-6 shadow-sm">
              <p className="text-gray-700 mb-4">“{t.quote}”</p>
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-500">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
