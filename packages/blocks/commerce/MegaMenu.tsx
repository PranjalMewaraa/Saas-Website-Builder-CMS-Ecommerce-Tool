import React from "react";

const defaultSections = [
  {
    title: "New Arrivals",
    links: [
      { label: "Latest Drop", href: "/products", badge: "New" },
      { label: "Trending", href: "/products?sort=newest" },
    ],
  },
  {
    title: "Collections",
    links: [
      { label: "Summer", href: "/products?collection=summer" },
      { label: "Essentials", href: "/products?collection=essentials" },
    ],
  },
];

export default function MegaMenuV1(props: any) {
  const {
    title = "Explore",
    subtitle = "Browse collections and shortcuts.",
    columns = 4,
    ctaText = "View all products",
    ctaHref = "/products",
    showSearch = true,
    searchPlaceholder = "Search products, collections, brands...",
    sections = defaultSections,
    promo = {
      title: "Weekend Drop",
      description: "Up to 40% off selected items.",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Shop Offer",
      ctaHref: "/products",
    },
  } = props || {};

  const gridCols = Math.max(1, Math.min(6, Number(columns) || 4));
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
  };

  return (
    <section className="w-full bg-white py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>
          <a
            href={ctaHref || "#"}
            className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            {ctaText}
          </a>
        </div>

        {showSearch ? (
          <input
            readOnly
            value=""
            placeholder={searchPlaceholder}
            className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm"
          />
        ) : null}

        <div className="grid gap-3" style={gridStyle}>
          {sections.map((section: any, idx: number) => (
            <div
              key={`${section?.title || "section"}-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="text-sm font-semibold text-slate-900">
                {section?.title || `Section ${idx + 1}`}
              </div>
              <div className="mt-2 space-y-1.5">
                {(section?.links || []).map((link: any, lidx: number) => (
                  <a
                    key={`${link?.label || "link"}-${lidx}`}
                    href={link?.href || "#"}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <span>{link?.label || `Link ${lidx + 1}`}</span>
                    {link?.badge ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        {link.badge}
                      </span>
                    ) : null}
                  </a>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
            <div className="text-sm font-semibold">{promo?.title || "Promotion"}</div>
            <p className="mt-2 text-sm text-slate-200">{promo?.description || ""}</p>
            {promo?.image ? (
              <img
                src={promo.image}
                alt={promo?.title || "Promo"}
                className="mt-3 h-28 w-full rounded-xl object-cover"
              />
            ) : null}
            <a
              href={promo?.ctaHref || "#"}
              className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
            >
              {promo?.ctaText || "Learn more"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

