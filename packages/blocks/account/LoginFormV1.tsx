"use client";

import { useState } from "react";

type Props = {
  tenantId: string;
  siteId: string;
  title?: string;
  subtitle?: string;
  emailLabel?: string;
  passwordLabel?: string;
  submitText?: string;
  signupHref?: string;
  signupText?: string;
  redirectTo?: string;
};

export default function LoginFormV1(props: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();
      const body = new URLSearchParams({
        csrfToken,
        email,
        password,
        tenant_id: props.tenantId,
        site_id: props.siteId,
        callbackUrl: props.redirectTo || "/account",
        json: "true",
      });
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.url && !String(data.url).includes("error")) {
        window.location.href = props.redirectTo || "/account";
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm space-y-4"
      aria-label="Sign in"
    >
      {props.title ? (
        <h1 className="text-2xl font-semibold">{props.title}</h1>
      ) : null}
      {props.subtitle ? (
        <p className="text-sm text-muted">{props.subtitle}</p>
      ) : null}

      <label className="block">
        <span className="block text-sm mb-1">{props.emailLabel || "Email"}</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="block text-sm mb-1">
          {props.passwordLabel || "Password"}
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {busy ? "Signing in…" : props.submitText || "Sign in"}
      </button>

      {props.signupHref ? (
        <p className="text-sm text-center">
          <a href={props.signupHref} className="underline">
            {props.signupText || "Create an account"}
          </a>
        </p>
      ) : null}
    </form>
  );
}
