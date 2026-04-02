"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

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
      setMessage({ type: "success", text: "Login successful. Redirecting..." });
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border rounded-xl p-6"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">
            {mode === "login" ? "Admin Login" : "Reset Password"}
          </h1>
          <p className="text-sm text-slate-600">
            {mode === "login"
              ? "Use your email and password to sign in."
              : "Temporary reset flow. Enter your email and set a new password."}
          </p>
        </div>
        {message ? (
          <div
            className={`rounded border px-3 py-2 text-sm ${
              message.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (message) setMessage(null);
          }}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder={mode === "login" ? "Password" : "New password"}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (message) setMessage(null);
          }}
        />
        {mode === "forgot" ? (
          <input
            className="w-full border p-2 rounded"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (message) setMessage(null);
            }}
          />
        ) : null}
        <button
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:opacity-60"
        >
          {loading
            ? mode === "login"
              ? "Signing in..."
              : "Updating password..."
            : mode === "login"
              ? "Sign In"
              : "Update Password"}
        </button>
        <button
          type="button"
          className="w-full text-sm text-slate-700 underline underline-offset-2"
          onClick={() => {
            setMode(mode === "login" ? "forgot" : "login");
            setPassword("");
            setConfirmPassword("");
            setMessage(null);
          }}
        >
          {mode === "login" ? "Forgot password?" : "Back to login"}
        </button>
      </form>
    </div>
  );
}
