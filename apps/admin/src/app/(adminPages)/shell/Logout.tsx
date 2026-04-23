"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
