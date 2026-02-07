"use client";
import { SessionProvider } from "next-auth/react";
import { UIProvider } from "./_components/ui/UiProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UIProvider>{children}</UIProvider>
    </SessionProvider>
  );
}
