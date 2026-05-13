"use client";

import { useEffect, useState } from "react";
import StarsAtomic from "./StarsAtomic";

type Review = {
  id: string;
  customer_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: number;
  created_at: string;
};

type Summary = {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

type Props = {
  slug?: string;
  path?: string;
  detailPathPrefix?: string;
  title?: string;
  emptyText?: string;
  showDistribution?: boolean;
  pageSize?: number;
};

function slugFromPath(path: string | undefined, prefix: string) {
  if (!path) return "";
  const base = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  if (!path.startsWith(base)) return "";
  return path.slice(base.length).replace(/^\/+/, "");
}

export default function ProductReviewsListV1(props: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const slug =
    props.slug ||
    slugFromPath(props.path, props.detailPathPrefix || "/products");

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const limit = props.pageSize || 20;
      const res = await fetch(
        `/api/v2/products/${encodeURIComponent(slug)}/reviews?limit=${limit}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!cancelled && data?.ok) {
        setReviews(data.reviews || []);
        setSummary(data.summary || null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, props.pageSize]);

  if (!slug) {
    return null;
  }
  if (loading) return <div className="text-sm text-muted">Loading reviews…</div>;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">{props.title || "Customer reviews"}</h2>
        {summary && summary.count > 0 ? (
          <div className="flex items-center gap-2">
            <StarsAtomic rating={summary.average} size="md" />
            <span className="text-sm">
              {summary.average.toFixed(1)} · {summary.count} review
              {summary.count === 1 ? "" : "s"}
            </span>
          </div>
        ) : null}
      </header>

      {props.showDistribution !== false && summary && summary.count > 0 ? (
        <ul className="space-y-1">
          {[5, 4, 3, 2, 1].map((r) => {
            const n = summary.distribution[r as 1 | 2 | 3 | 4 | 5] || 0;
            const pct = summary.count ? Math.round((n / summary.count) * 100) : 0;
            return (
              <li
                key={r}
                className="grid grid-cols-[40px_1fr_40px] items-center gap-2 text-sm"
              >
                <span>{r}★</span>
                <span className="h-2 rounded bg-gray-200 overflow-hidden">
                  <span
                    className="block h-full bg-amber-500"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="text-right text-muted">{n}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">
          {props.emptyText || "No reviews yet. Be the first to leave one."}
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center gap-2 mb-1">
                <StarsAtomic rating={r.rating} size="sm" />
                {r.is_verified ? (
                  <span className="text-xs rounded bg-emerald-100 text-emerald-700 px-2 py-0.5">
                    Verified buyer
                  </span>
                ) : null}
              </div>
              {r.title ? <h3 className="font-medium">{r.title}</h3> : null}
              {r.body ? <p className="text-sm mt-1 whitespace-pre-line">{r.body}</p> : null}
              <p className="text-xs text-muted mt-2">
                {r.customer_name || "Customer"} ·{" "}
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
