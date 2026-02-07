"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useUI } from "../_components/ui/UiProvider";

export default function SignupPage() {
  const { toast } = useUI();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!data.ok) {
      toast({ variant: "error", title: "Signup failed", description: data.error });
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      tenant: data.tenant_id,
      email: form.email,
      password: form.password,
      redirect: true,
      callbackUrl: "/onboarding",
    });
  }

  return (
    <div className="max-w-md mx-auto p-10 space-y-4">
      <h1 className="text-2xl font-bold">Create account</h1>

      <input
        placeholder="Name"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Email"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Password"
        type="password"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button
        disabled={loading}
        onClick={submit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Creating..." : "Sign up"}
      </button>
    </div>
  );
}
