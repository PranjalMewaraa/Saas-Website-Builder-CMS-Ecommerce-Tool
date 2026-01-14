"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [tenant, setTenant] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn("credentials", {
      tenant,
      email,
      password,
      callbackUrl: "/",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border rounded-xl p-6"
      >
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <input
          className="w-full border p-2 rounded"
          placeholder="Tenant ID (t_...)"
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-black text-white p-2 rounded">
          Sign In
        </button>
      </form>
    </div>
  );
}
