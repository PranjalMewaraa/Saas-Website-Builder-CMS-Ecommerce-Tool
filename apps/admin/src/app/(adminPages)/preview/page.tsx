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
  const search = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (typeof v === "string") acc[k] = v;
      return acc;
    }, {} as Record<string, string>),
  ).toString();

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

  let page = snapshot.pages?.[path];
  if (!page?.layout) {
    const productSlugMatch =
      path.startsWith("/products/") && path.split("/").length >= 3;
    if (productSlugMatch && snapshot.pages?.["/products/[slug]"]) {
      page = snapshot.pages["/products/[slug]"];
    } else {
      return (
        <div className="p-6">
          Page not found in draft snapshot:{" "}
          <span className="font-mono">{path}</span>
        </div>
      );
    }
  }

  const themeTokens = { ...(snapshot.theme?.tokens || {}) } as Record<
    string,
    string
  >;
  if (!themeTokens["--color-on-primary"] && themeTokens["--color-primary"]) {
    const onPrimary = pickOnColor(themeTokens["--color-primary"]);
    if (onPrimary) themeTokens["--color-on-primary"] = onPrimary;
  }

  return (
    <div className="theme-root" style={themeTokens as React.CSSProperties}>
      <div className="border-b p-2 text-sm bg-yellow-100">
        Preview Mode · Draft Snapshot:{" "}
        <span className="font-mono">{site.draft_snapshot_id}</span> · Path:{" "}
        <span className="font-mono">{path}</span>
      </div>

      <RenderPage
        layout={page.layout}
        ctx={{
          tenantId: site.tenant_id,
          storeId: site.store_id,
          snapshot,
          path,
          search: search ? `?${search}` : "",
          mode: "preview",
        }}
      />
    </div>
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
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? "#0f172a" : "#ffffff";
}
