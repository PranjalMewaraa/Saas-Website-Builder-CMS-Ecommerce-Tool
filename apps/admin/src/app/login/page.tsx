"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Card, Input, buttonClass, cn } from "@acme/ui";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "forgot") {
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match." });
        setLoading(false);
        return;
      }

      const resetRes = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const resetData = await resetRes.json().catch(() => ({}));
      if (!resetRes.ok || !resetData?.ok) {
        setMessage({
          type: "error",
          text: resetData?.error || "Password reset failed.",
        });
        setLoading(false);
        return;
      }

      setMessage({
        type: "success",
        text: resetData.message || "Password updated. Please log in.",
      });
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
      redirect: false,
    });

    if (res?.ok && res.url) {
      setMessage({ type: "success", text: "Login successful. Redirecting…" });
      window.location.href = res.url;
      return;
    }

    if (res?.error) {
      setMessage({
        type: "error",
        text:
          res.error === "CredentialsSignin"
            ? "Invalid email or password."
            : "Login failed. Please try again.",
      });
    } else {
      setMessage({ type: "error", text: "Unable to login right now." });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
      <Card className="w-full max-w-sm">
        <div className="mb-5 space-y-1">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {mode === "login" ? "Log in" : "Reset password"}
          </h1>
          <p className="text-sm text-muted">
            {mode === "login"
              ? "Use your email and password to sign in."
              : "Temporary reset flow. Enter your email and set a new password."}
          </p>
        </div>

        {message ? (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={cn(
              "mb-4 rounded-control border px-3 py-2 text-sm",
              message.type === "error"
                ? "border-danger/30 bg-danger-soft text-danger"
                : "border-accent/30 bg-accent-soft text-accent",
            )}
          >
            {message.text}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (message) setMessage(null);
            }}
          />
          <Input
            label={mode === "login" ? "Password" : "New password"}
            type="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (message) setMessage(null);
            }}
          />
          {mode === "forgot" ? (
            <Input
              label="Confirm new password"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (message) setMessage(null);
              }}
            />
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={buttonClass({ variant: "accent", className: "w-full" })}
          >
            {loading
              ? mode === "login"
                ? "Signing in…"
                : "Updating password…"
              : mode === "login"
                ? "Sign in"
                : "Update password"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-muted underline underline-offset-2 hover:text-ink"
          onClick={() => {
            setMode(mode === "login" ? "forgot" : "login");
            setPassword("");
            setConfirmPassword("");
            setMessage(null);
          }}
        >
          {mode === "login" ? "Forgot password?" : "Back to login"}
        </button>

        {mode === "login" ? (
          <p className="mt-4 text-center text-sm text-muted">
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-accent hover:underline"
            >
              Create an account
            </Link>
          </p>
        ) : null}
      </Card>
    </div>
  );
}
