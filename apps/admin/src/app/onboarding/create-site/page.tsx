"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSitePage() {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const router = useRouter();

  async function submit() {
    const res = await fetch("/api/onboarding/create-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, handle }),
    });

    const data = await res.json();
    if (!data.ok) return alert(data.error);

    router.push(`/content/pages?site_id=${data.site_id}`);
  }

  return (
    <div className="max-w-md mx-auto p-10 space-y-4">
      <h1 className="text-xl font-bold">Create your site</h1>

      <input
        placeholder="Site name"
        className="border p-2 w-full"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Handle (demo-site)"
        className="border p-2 w-full"
        onChange={(e) => setHandle(e.target.value)}
      />

      <button
        onClick={submit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Create site
      </button>
    </div>
  );
}
