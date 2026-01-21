"use client";

import { useRouter } from "next/navigation";

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto p-10 space-y-6">
      <h1 className="text-3xl font-bold">Welcome 🎉</h1>
      <p>You’re 1 minute away from launching your site.</p>

      <ul className="list-disc ml-6">
        <li>Create your website</li>
        <li>Design pages visually</li>
        <li>Publish instantly</li>
      </ul>

      <button
        className="bg-black text-white px-5 py-3 rounded"
        onClick={() => router.push("/onboarding/create-site")}
      >
        Continue
      </button>
    </div>
  );
}
