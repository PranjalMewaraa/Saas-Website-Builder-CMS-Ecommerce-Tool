import { headers } from "next/headers";
import type { CSSProperties } from "react";
import {
  findSiteByDomain,
  findSiteByHandle,
  findSnapshotById,
} from "../../../../packages/db-mongo";
import { RenderPage } from "../../../../packages/renderer";

function themeStyle(tokens?: Record<string, string>): CSSProperties {
  if (!tokens) return {};
  return tokens as unknown as CSSProperties; // tokens like { "--color-primary": "#2563EB" }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ handle?: string | string[] }>;
}) {
  const sp = await searchParams;

  // handle can be string | string[] | undefined
  const handle = Array.isArray(sp.handle) ? sp.handle[0] : sp.handle;

  const h = await headers();
  const host = h.get("host") || "";

  const site = handle
    ? await findSiteByHandle(handle)
    : await findSiteByDomain(host);

  if (!site)
    return <div className="p-6">Site not found. Try /?handle=demo-site</div>;
  if (!site.published_snapshot_id)
    return <div className="p-6">No published snapshot</div>;

  const snapshot = await findSnapshotById(site.published_snapshot_id);
  if (!snapshot) return <div className="p-6">Snapshot missing</div>;

  const page = snapshot.pages?.["/"];
  if (!page?.layout)
    return <div className="p-6">Home page missing in snapshot</div>;

  return (
    <div style={themeStyle(snapshot.theme?.tokens)}>
      <RenderPage
        layout={page.layout}
        ctx={{ tenantId: site.tenant_id, storeId: site.store_id, snapshot }}
      />
    </div>
  );
}
