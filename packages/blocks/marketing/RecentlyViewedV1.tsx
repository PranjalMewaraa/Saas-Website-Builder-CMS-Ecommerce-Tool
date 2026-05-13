"use client";

import { useEffect, useState } from "react";

type ViewedItem = {
  slug: string;
  title: string;
  image?: string;
  price_cents?: number;
};

type Props = {
  title?: string;
  emptyText?: string;
  detailPathPrefix?: string;
  limit?: number;
  currency?: string;
};

const STORAGE_KEY = "acme_recently_viewed_v1";
const MAX_STORED = 24;

export function recordRecentlyViewed(item: ViewedItem) {
  if (typeof window === "undefined" || !item?.slug) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: ViewedItem[] = raw ? JSON.parse(raw) : [];
    const next = [item, ...parsed.filter((i) => i.slug !== item.slug)].slice(
      0,
      MAX_STORED,
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export default function RecentlyViewedV1(props: Props) {
  const [items, setItems] = useState<ViewedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: ViewedItem[] = raw ? JSON.parse(raw) : [];
      setItems(parsed.slice(0, props.limit || 8));
    } catch {}
    setLoaded(true);
  }, [props.limit]);

  if (!loaded) return null;
  if (items.length === 0) {
    return props.emptyText ? (
      <div className="text-sm text-muted">{props.emptyText}</div>
    ) : null;
  }

  const prefix = (props.detailPathPrefix || "/products").replace(/\/+$/, "");
  const currency = props.currency || "INR";

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">
        {props.title || "Recently viewed"}
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((it) => (
          <li key={it.slug}>
            <a href={`${prefix}/${encodeURIComponent(it.slug)}`} className="block group">
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.title}
                  className="w-full aspect-square object-cover rounded"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square bg-slate-100 rounded" />
              )}
              <div className="mt-2 text-sm font-medium line-clamp-2 group-hover:underline">
                {it.title}
              </div>
              {typeof it.price_cents === "number" ? (
                <div className="text-sm text-muted">
                  {formatMoney(it.price_cents, currency)}
                </div>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
