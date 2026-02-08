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
    const token = searchParams.get("token");
    if (handle) {
      window.localStorage.setItem("storefront_handle", handle);
    }
    if (token) {
      window.localStorage.setItem("storefront_token", token);
    }

    const stored = window.localStorage.getItem("storefront_handle");
    const storedToken = window.localStorage.getItem("storefront_token");
    if (!stored && !storedToken) return;

    const params = new URLSearchParams(searchParams.toString());
    if (stored && !params.get("handle")) params.set("handle", stored);
    if (storedToken && !params.get("token")) params.set("token", storedToken);
    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;
    if (next !== current) router.replace(next);
  }, [pathname, router, searchParams]);

  return <CartProvider>{children}</CartProvider>;
}
