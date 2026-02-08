"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CartProvider } from "@acme/blocks";

export default function StorefrontProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = searchParams.get("handle");
    if (handle) {
      window.localStorage.setItem("storefront_handle", handle);
      return;
    }

    const stored = window.localStorage.getItem("storefront_handle");
    if (!stored) return;

    const params = new URLSearchParams(searchParams.toString());
    if (!params.get("handle")) {
      params.set("handle", stored);
      const next = `${pathname}?${params.toString()}`;
      router.replace(next);
    }
  }, [pathname, router, searchParams]);

  return <CartProvider>{children}</CartProvider>;
}
