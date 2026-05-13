"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  emailLabel?: string;
  submitText?: string;
  successText?: string;
  formId?: string;
  delayMs?: number;
  exitIntent?: boolean;
  cooldownDays?: number;
  handle?: string;
};

const COOLDOWN_KEY = "acme_newsletter_popup_v1";

function shouldShow(cooldownDays: number) {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return true;
    const last = Number(raw);
    if (!Number.isFinite(last)) return true;
    const ms = cooldownDays * 24 * 60 * 60 * 1000;
    return Date.now() - last > ms;
  } catch {
    return true;
  }
}

function markShown() {
  try {
    window.localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {}
}

export default function NewsletterPopupV1(props: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seenRef = useRef(false);

  const delay = Math.max(0, props.delayMs ?? 4000);
  const cooldownDays = Math.max(0, props.cooldownDays ?? 14);

  useEffect(() => {
    if (!shouldShow(cooldownDays)) return;
    let timeoutId: any;
    const show = () => {
      if (seenRef.current) return;
      seenRef.current = true;
      setOpen(true);
      markShown();
    };
    timeoutId = setTimeout(show, delay);

    const onExit = (e: MouseEvent) => {
      if (e.clientY < 0) show();
    };
    if (props.exitIntent !== false) {
      document.addEventListener("mouseout", onExit);
    }

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mouseout", onExit);
    };
  }, [delay, cooldownDays, props.exitIntent]);

  if (!open) return null;

  const close = () => setOpen(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setBusy(true);
    try {
      if (props.formId) {
        const res = await fetch("/api/forms/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formId: props.formId,
            handle: props.handle,
            values: { email },
          }),
        });
        if (!res.ok) throw new Error("submit_failed");
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
        >
          ×
        </button>
        {done ? (
          <div className="text-center py-6">
            <h2 className="text-xl font-semibold mb-2">
              {props.successText || "You're in!"}
            </h2>
            <p className="text-sm text-slate-600">
              Thanks — check your inbox to confirm.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold">
              {props.title || "Join our newsletter"}
            </h2>
            {props.subtitle ? (
              <p className="text-sm text-slate-600 mt-1">{props.subtitle}</p>
            ) : null}
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <input
                type="email"
                required
                value={email}
                placeholder={props.emailLabel || "you@example.com"}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              {error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
              >
                {busy ? "Subscribing…" : props.submitText || "Subscribe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
