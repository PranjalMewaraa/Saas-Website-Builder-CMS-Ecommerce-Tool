import React from "react";

const defaultItems = [
  { name: "Classic Tee", qty: 1, price: 899, image: "" },
  { name: "Athletic Jogger", qty: 1, price: 1499, image: "" },
  { name: "Everyday Cap", qty: 1, price: 499, image: "" },
];

function formatMoney(value: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${Math.round(value)}`;
  }
}

export default function BundleOfferV1(props: any) {
  const {
    title = "Bundle and save more",
    subtitle = "Get instant discount when buying together.",
    currency = "INR",
    discountType = "percent",
    discountValue = 10,
    ctaText = "Buy bundle",
    ctaHref = "/cart",
    note = "Discount applies at checkout.",
    items = defaultItems,
  } = props || {};

  const subtotal = (items || []).reduce((sum: number, item: any) => {
    const qty = Math.max(1, Number(item?.qty || 1));
    const price = Math.max(0, Number(item?.price || 0));
    return sum + qty * price;
  }, 0);
  const discount =
    discountType === "fixed"
      ? Math.min(subtotal, Math.max(0, Number(discountValue || 0)))
      : (subtotal * Math.max(0, Number(discountValue || 0))) / 100;
  const total = Math.max(0, subtotal - discount);

  return (
    <section className="w-full bg-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-3">
            {(items || []).map((item: any, idx: number) => (
              <div
                key={`${item?.name || "item"}-${idx}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="h-14 w-14 rounded-lg bg-white" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {item?.name || `Item ${idx + 1}`}
                  </div>
                  <div className="text-xs text-slate-500">
                    Qty {Math.max(1, Number(item?.qty || 1))}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatMoney(Math.max(0, Number(item?.price || 0)), currency)}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
            <div className="text-sm text-slate-300">Bundle Summary</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Subtotal</span>
                <span>{formatMoney(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Discount</span>
                <span className="text-emerald-300">
                  -{formatMoney(discount, currency)}
                </span>
              </div>
              <div className="h-px bg-white/20" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(total, currency)}</span>
              </div>
            </div>
            <a
              href={ctaHref || "#"}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              {ctaText}
            </a>
            <p className="mt-3 text-xs text-slate-300">{note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

