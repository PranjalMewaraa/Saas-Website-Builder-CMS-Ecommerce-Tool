"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Card, Input, buttonClass } from "@acme/ui";
import { useUI } from "../_components/ui/UiProvider";

export default function SignupPage() {
  const { toast } = useUI();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => ({}));
    if (!data.ok) {
      toast({
        variant: "error",
        title: "Signup failed",
        description: data.error,
      });
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: true,
      callbackUrl: "/onboarding",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
      <Card className="w-full max-w-sm">
        <div className="mb-5 space-y-1">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Create your account
          </h1>
          <p className="text-sm text-muted">
            Set up your workspace to start building.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className={buttonClass({ variant: "accent", className: "w-full" })}
          >
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
