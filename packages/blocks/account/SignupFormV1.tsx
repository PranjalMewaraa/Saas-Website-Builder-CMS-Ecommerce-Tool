"use client";

import { useState } from "react";

type Props = {
  tenantId: string;
  siteId: string;
  title?: string;
  subtitle?: string;
  nameLabel?: string;
  emailLabel?: string;
  passwordLabel?: string;
  submitText?: string;
  loginHref?: string;
  loginText?: string;
  redirectTo?: string;
};

export default function SignupFormV1(props: Props) {
  const [name, setName] = useState("");
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
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          tenant_id: props.tenantId,
          site_id: props.siteId,
        }),
      });
      const signupData = await signupRes.json().catch(() => ({}));
      if (!signupRes.ok || !signupData?.ok) {
        if (signupData?.error === "email_in_use") {
          setError("That email is already registered. Try signing in.");
        } else if (signupData?.error === "weak_password") {
          setError("Password must be at least 8 characters.");
        } else if (signupData?.error === "invalid_email") {
          setError("Please enter a valid email address.");
        } else {
          setError("Could not create account. Please try again.");
        }
        setBusy(false);
        return;
      }

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
      const loginRes = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const loginData = await loginRes.json().catch(() => ({}));
      if (loginData?.url && !String(loginData.url).includes("error")) {
        window.location.href = props.redirectTo || "/account";
      } else {
        window.location.href = props.loginHref || "/account/login";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm space-y-4"
      aria-label="Create account"
    >
      {props.title ? (
        <h1 className="text-2xl font-semibold">{props.title}</h1>
      ) : null}
      {props.subtitle ? (
        <p className="text-sm text-muted">{props.subtitle}</p>
      ) : null}

      <label className="block">
        <span className="block text-sm mb-1">{props.nameLabel || "Name"}</span>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </label>

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
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <span className="block text-xs text-muted mt-1">
          Minimum 8 characters.
        </span>
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
        {busy ? "Creating account…" : props.submitText || "Create account"}
      </button>

      {props.loginHref ? (
        <p className="text-sm text-center">
          <a href={props.loginHref} className="underline">
            {props.loginText || "Already have an account? Sign in"}
          </a>
        </p>
      ) : null}
    </form>
  );
}
