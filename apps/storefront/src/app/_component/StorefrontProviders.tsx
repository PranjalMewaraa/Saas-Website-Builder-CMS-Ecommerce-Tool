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
    const sid = searchParams.get("sid");
    if (handle) {
      window.localStorage.setItem("storefront_handle", handle);
    }
    if (sid) {
      window.localStorage.setItem("storefront_sid", sid);
    }
    // Never persist preview token; otherwise published URLs can get forced into draft mode.
    window.localStorage.removeItem("storefront_token");

    const stored = window.localStorage.getItem("storefront_handle");
    const storedSid = window.localStorage.getItem("storefront_sid");
    if (!stored && !storedSid) return;

    const params = new URLSearchParams(searchParams.toString());
    if (stored && !params.get("handle")) params.set("handle", stored);
    if (storedSid && !params.get("sid")) params.set("sid", storedSid);
    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;
    if (next !== current) router.replace(next);
  }, [pathname, router, searchParams]);

  return <CartProvider>{children}</CartProvider>;
}
