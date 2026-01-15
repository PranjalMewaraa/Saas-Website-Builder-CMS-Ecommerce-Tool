"use client";

import { usePathname } from "next/navigation";
import AdminShell from "./AdminShell";

export default function ShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // routes that should NOT show the dashboard chrome
  const noShell =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api");

  if (noShell) return <>{children}</>;

  return <AdminShell>{children}</AdminShell>;
}
