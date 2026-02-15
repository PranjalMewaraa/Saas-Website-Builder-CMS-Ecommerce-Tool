"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "../../_components/ui/UiProvider";

export default function CreateSitePage() {
  const { toast } = useUI();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/onboarding/create-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, handle }),
    });

    const data = await res.json();
    if (!data.ok) {
      toast({
        variant: "error",
        title: "Could not create site",
        description: data.error || "Please try again.",
      });
      setLoading(false);
      return;
    }

    router.push(`/content/pages?site_id=${data.site_id}&onboarding=1`);
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
        disabled={loading || !name.trim() || !handle.trim()}
        onClick={submit}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create site"}
      </button>
    </div>
  );
}
