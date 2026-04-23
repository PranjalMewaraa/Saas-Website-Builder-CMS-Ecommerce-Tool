"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function OnboardingLogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
