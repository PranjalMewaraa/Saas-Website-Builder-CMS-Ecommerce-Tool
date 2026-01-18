// app/[...slug]/page.tsx     ← or wherever this file lives

import { headers } from "next/headers";
import { RenderPage } from "@acme/renderer";
import { getMongoDb, getSnapshotById, getSiteByHandle } from "@acme/db-mongo";

export const dynamic = "force-dynamic";

function normalizePath(slugParts?: string[]) {
  if (!slugParts || slugParts.length === 0) return "/";
  const p =
    "/" +
    slugParts
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .join("/");
  return p === "" ? "/" : p;
}

async function resolveSite() {
  const h = headers();
  const hostRaw = (await h).get("host") || "";
  const host = hostRaw.split(":")[0];

  const db = await getMongoDb();
  const sites = db.collection("sites");

  const site =
    (await sites.findOne({
      $or: [
        { primary_domain: host },
        { domains: host },
        { "domains.host": host },
      ],
    })) || null;

  if (site) return site;

  const fallback = process.env.DEFAULT_SITE_HANDLE || "demo-site";
  return await getSiteByHandle(fallback);
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
  console.log("Snapshot:", snapshot);
  const page = snapshot.pages?.[path] || null;
  if (!page?.layout) {
    return (
      <div className="p-6">
        404 — Page not found: <span className="font-mono">{path}</span>
      </div>
    );
  }

  return (
    <div style={(snapshot.theme?.tokens || {}) as React.CSSProperties}>
      <RenderPage
        layout={page.layout}
        ctx={{ tenantId: site.tenant_id, storeId: site.store_id, snapshot }}
      />
    </div>
  );
}
