// app/[...slug]/page.tsx     ← or wherever this file lives

import { headers } from "next/headers";
import { RenderPage } from "@acme/renderer";
import { getMongoDb, getSnapshotById, getSiteByHandle } from "@acme/db-mongo";
import type { Metadata } from "next";
import { buildSeo } from "@acme/renderer/seo";
import { organizationSchema, webpageSchema } from "@acme/renderer/seo/jsonld";
import { ShoppingCart } from "lucide-react";
export const dynamic = "force-dynamic";

export function normalizePath(slugParts?: string[]) {
  if (!slugParts || slugParts.length === 0) return "/";
  const p =
    "/" +
    slugParts
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .join("/");
  return p === "" ? "/" : p;
}

export async function resolveSite() {
  const { headers } = await import("next/headers");

  const h = await headers();

  const host = (h.get("host") || "").split(":")[0];

  // Read query params from RSC request header
  const search = h.get("x-search") || h.get("next-url") || "";

  let handle: string | null = null;

  if (search.includes("?")) {
    const url = new URL(search, "http://localhost");
    console.log("URLS", url);
    handle = url.searchParams.get("handle");
  }

  const db = await getMongoDb();
  const sites = db.collection("sites");

  // 1. localhost → query param
  if ((host === "localhost" || host === "127.0.0.1") && handle) {
    const site = await sites.findOne({ handle });
    if (site) return site;
  }

  // 2. subdomain
  const parts = host.split(".");
  if (parts.length >= 3) {
    const site = await sites.findOne({ handle: parts[0] });
    if (site) return site;
  }

  // 3. fallback
  return getSiteByHandle(process.env.DEFAULT_SITE_HANDLE || "nikee");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const path = normalizePath(resolvedParams.slug);

  const site = await resolveSite();
  if (!site?.published_snapshot_id) return {};

  const snapshot = await getSnapshotById(site.published_snapshot_id);
  if (!snapshot) return {};

  const seo = buildSeo(snapshot, path);

  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
  };

  if (seo.ogImage) {
    metadata.openGraph = {
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
      type: "website",
    };

    metadata.twitter = {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    };
  }

  if (seo.canonical) {
    metadata.alternates = {
      canonical: seo.canonical,
    };
  }

  if (seo.robots) {
    metadata.robots = {
      index: seo.robots.index,
      follow: seo.robots.follow,
    };
  }

  return metadata;
}

// ── Changed signature ────────────────────────────────────────
export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>; // ← this is the key change
}) {
  // Await params (safe even if already resolved)
  const resolvedParams = await params;
  const path = normalizePath(resolvedParams.slug);

  const site = await resolveSite();
  if (!site) return <div className="p-6">Site not found</div>;

  if (!site.published_snapshot_id) {
    return <div className="p-6">Site not published yet</div>;
  }

  const snapshot = await getSnapshotById(site.published_snapshot_id);
  if (!snapshot) return <div className="p-6">Published snapshot missing</div>;

  let page = snapshot.pages?.[path] || null;
  if (!page?.layout) {
    const productSlugMatch =
      path.startsWith("/products/") && path.split("/").length >= 3;
    if (productSlugMatch && snapshot.pages?.["/products/[slug]"]) {
      page = snapshot.pages["/products/[slug]"];
    } else {
      return (
        <div className="p-6">
          404 — Page not found: <span className="font-mono">{path}</span>
        </div>
      );
    }
  }
  const meta = page.seo || {};
  const h = headers();
  const host = (await h).get("host") || "";
  const search = (await h).get("x-search") || (await h).get("next-url") || "";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}${path}`;

  const org = organizationSchema(site);
  const web = webpageSchema(url, meta.title, meta.description);

  const themeTokens = { ...(snapshot.theme?.tokens || {}) } as Record<
    string,
    string
  >;
  if (!themeTokens["--color-on-primary"] && themeTokens["--color-primary"]) {
    const onPrimary = pickOnColor(themeTokens["--color-primary"]);
    if (onPrimary) themeTokens["--color-on-primary"] = onPrimary;
  }

  const hasCartPage = Boolean(snapshot.pages?.["/cart"]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(web) }}
      />
      <div className="theme-root" style={themeTokens as React.CSSProperties}>
        <RenderPage
          layout={page.layout}
          ctx={{
            tenantId: site.tenant_id,
            storeId: site.store_id,
            snapshot,
            path,
            search,
          }}
        />
        {hasCartPage ? (
          <a
            href="/cart"
            aria-label="Open cart"
            title="Cart"
            className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingCart size={18} strokeWidth={2} className="pointer-events-none" />
          </a>
        ) : null}
      </div>
    </>
  );
}

function pickOnColor(color: string) {
  const hex = color.trim();
  if (!hex.startsWith("#")) return "";
  const raw = hex.slice(1);
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (full.length !== 6) return "";
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}
