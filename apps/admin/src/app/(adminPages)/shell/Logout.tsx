"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Log out
    </button>
  );
}
