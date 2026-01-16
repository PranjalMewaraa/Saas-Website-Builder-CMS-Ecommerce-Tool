import { RenderPage } from "@acme/renderer";
import { getSiteByHandle, getSnapshotById } from "@acme/db-mongo";

export const dynamic = "force-dynamic"; // never cache preview

function normalizePath(input?: string) {
  let p = (input || "/").trim();
  if (!p) p = "/";
  if (!p.startsWith("/")) p = "/" + p;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  p = p.replace(/\/{2,}/g, "/");
  return p;
}

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const handle = params.handle || "";
  const token = params.token || "";
  const path = normalizePath(params.path || "/");

  if (!handle || !token) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Missing preview params</h1>
        <p className="opacity-70 mt-2">
          Use /preview?handle=...&token=...&path=/optional
        </p>
      </div>
    );
  }

  const site = await getSiteByHandle(handle);
  if (!site) return <div className="p-6">Site not found</div>;

  // token gate
  if (!site.preview_token || token !== site.preview_token) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unauthorized preview</h1>
        <p className="opacity-70 mt-2">Invalid token.</p>
      </div>
    );
  }

  if (!site.draft_snapshot_id) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">No draft snapshot generated</h1>
        <p className="opacity-70 mt-2">
          Go to Admin → Content → Preview and generate one.
        </p>
      </div>
    );
  }

  const snapshot = await getSnapshotById(site.draft_snapshot_id);
  if (!snapshot) return <div className="p-6">Draft snapshot missing</div>;

  const page = snapshot.pages?.[path];
  if (!page?.layout) {
    return (
      <div className="p-6">
        Page not found in draft snapshot:{" "}
        <span className="font-mono">{path}</span>
      </div>
    );
  }

  return (
    <div style={(snapshot.theme?.tokens || {}) as React.CSSProperties}>
      <div className="border-b p-2 text-sm bg-yellow-100">
        Preview Mode · Draft Snapshot:{" "}
        <span className="font-mono">{site.draft_snapshot_id}</span> · Path:{" "}
        <span className="font-mono">{path}</span>
      </div>

      <RenderPage
        layout={page.layout}
        ctx={{ tenantId: site.tenant_id, storeId: site.store_id, snapshot }}
      />
    </div>
  );
}
