"use client";

import { useEffect, useState } from "react";

type Props = {
  slug?: string;
  path?: string;
  detailPathPrefix?: string;
  title?: string;
  submitText?: string;
  signInHref?: string;
  signInText?: string;
};

type AuthState = "loading" | "anonymous" | "authenticated";

function slugFromPath(path: string | undefined, prefix: string) {
  if (!path) return "";
  const base = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  if (!path.startsWith(base)) return "";
  return path.slice(base.length).replace(/^\/+/, "");
}

export default function ProductReviewSubmitV1(props: Props) {
  const slug =
    props.slug ||
    slugFromPath(props.path, props.detailPathPrefix || "/products");

  const [auth, setAuth] = useState<AuthState>("loading");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/account/me");
      if (cancelled) return;
      setAuth(res.ok ? "authenticated" : "anonymous");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!slug) return null;

  if (auth === "loading") {
    return <div className="text-sm text-muted">Loading…</div>;
  }

  if (auth === "anonymous") {
    return (
      <div className="text-sm">
        <a href={props.signInHref || "/account/login"} className="underline">
          {props.signInText || "Sign in to leave a review."}
        </a>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/v2/products/${encodeURIComponent(slug)}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, title, body }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        if (data?.error === "already_reviewed") {
          setError("You've already reviewed this product.");
        } else if (data?.error === "invalid_rating") {
          setError("Please choose a rating from 1 to 5.");
        } else {
          setError("Could not submit your review. Please try again.");
        }
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="text-sm text-emerald-700">
        Thanks — your review has been posted.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-3 border rounded p-4"
    >
      <h3 className="text-lg font-semibold">{props.title || "Write a review"}</h3>

      <div>
        <label className="block text-sm mb-1">Rating</label>
        <div className="flex gap-1" role="radiogroup">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={rating === r}
              onClick={() => setRating(r)}
              className="text-2xl leading-none"
              style={{ color: r <= rating ? "#f59e0b" : "#d1d5db" }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="block text-sm mb-1">Title (optional)</span>
        <input
          type="text"
          value={title}
          maxLength={255}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="block text-sm mb-1">Review (optional)</span>
        <textarea
          value={body}
          maxLength={4000}
          rows={4}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </label>

      {error ? (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
      >
        {busy ? "Submitting…" : props.submitText || "Submit review"}
      </button>
    </form>
  );
}
