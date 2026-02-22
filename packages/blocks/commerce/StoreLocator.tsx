import React from "react";

const defaults = [
  {
    name: "Flagship Store",
    badge: "Open",
    address: "21 Market Street",
    city: "Mumbai",
    state: "MH",
    phone: "+91 90000 00001",
    email: "flagship@example.com",
    hours: "Mon-Sat 10 AM - 9 PM",
    mapUrl: "https://maps.google.com/?q=Mumbai",
  },
];

export default function StoreLocatorV1(props: any) {
  const {
    title = "Find a store near you",
    subtitle = "See address, contact and opening hours.",
    searchPlaceholder = "Search city or area",
    showMap = true,
    ctaText = "Contact support",
    ctaHref = "/contact",
    stores = defaults,
  } = props || {};

  return (
    <section className="w-full bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>
          <a
            href={ctaHref || "#"}
            className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            {ctaText}
          </a>
        </div>

        <input
          readOnly
          value=""
          placeholder={searchPlaceholder}
          className="mb-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
        />

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            {(stores || []).map((store: any, idx: number) => (
              <div
                key={`${store?.name || "store"}-${idx}`}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-base font-semibold text-slate-900">
                    {store?.name || `Store ${idx + 1}`}
                  </div>
                  {store?.badge ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      {store.badge}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {store?.address || ""}
                  <br />
                  {[store?.city, store?.state].filter(Boolean).join(", ")}
                  <br />
                  {store?.hours || ""}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {store?.phone ? (
                    <a href={`tel:${store.phone}`} className="rounded-full border px-3 py-1.5">
                      Call
                    </a>
                  ) : null}
                  {store?.email ? (
                    <a href={`mailto:${store.email}`} className="rounded-full border px-3 py-1.5">
                      Email
                    </a>
                  ) : null}
                  {store?.mapUrl ? (
                    <a
                      href={store.mapUrl}
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-white"
                    >
                      Open Map
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {showMap ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Map Preview
              </div>
              <div className="h-[360px] rounded-xl border border-dashed border-slate-300 bg-slate-100 p-3 text-sm text-slate-500">
                Connect map URL per store in inspector.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

