import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import {
  getOrCreateTheme,
  listMenus,
  listPages,
  listStylePresets,
  createSnapshot,
  ensureSitePreviewToken,
  setDraftSnapshotId,
  getMongoDb,
} from "@acme/db-mongo";
import { listAssetsForSnapshot } from "@acme/db-mongo";

function newDraftSnapshotId(site_id: string) {
  return `draft_${site_id}_${Date.now()}`;
}

// Minimal typing to avoid ObjectId overload issues in TS
type SiteDocLoose = {
  _id: any;
  tenant_id: string;
  handle: string;
};

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const handleParam = searchParams.get("handle") || "demo-site"; // MVP default

  await requireModule({ tenant_id, site_id, module: "builder" });

  const db = await getMongoDb();

  // ✅ FIX: typed collection so _id can be string/ObjectId without TS overload errors
  const sitesCol = db.collection<SiteDocLoose>("sites");

  const site = await sitesCol.findOne({ _id: site_id as any, tenant_id });
  if (!site) {
    return NextResponse.json(
      { ok: false, error: "Site not found" },
      { status: 404 }
    );
  }

  // ensure preview token exists
  const token = await ensureSitePreviewToken(tenant_id, site_id);

  // compile "draft snapshot"
  const theme = await getOrCreateTheme(tenant_id, site_id);
  const menus = await listMenus(tenant_id, site_id);
  const pages = await listPages(tenant_id, site_id);
  const presets = await listStylePresets(tenant_id, site_id);
  const assets = await listAssetsForSnapshot(tenant_id, site_id);

  const snapshot_id = newDraftSnapshotId(site_id);

  const snapshot: any = {
    _id: snapshot_id,
    tenant_id,
    site_id,
    handle: site.handle, // ✅ add handle to snapshot

    is_draft: true,
    version: Date.now(),
    created_by: session.user.user_id,
    created_at: new Date(),

    assets,

    theme: { tokens: theme.draft_tokens },
    stylePresets: Object.fromEntries(
      presets.map((p) => [
        p._id,
        { name: p.name, style: p.style, target: p.target },
      ])
    ),
    menus: Object.fromEntries(
      menus.map((m) => [m._id, { tree: m.draft_tree }])
    ),
    pages: Object.fromEntries(
      pages.map((p) => [p.slug, { seo: p.seo ?? {}, layout: p.draft_layout }])
    ),
    templates: {},
  };

  await createSnapshot(snapshot);
  await setDraftSnapshotId(tenant_id, site_id, snapshot_id);

  const previewUrl = `http://localhost:3002/preview?handle=${encodeURIComponent(
    handleParam
  )}&token=${encodeURIComponent(token)}`;

  return NextResponse.json({ ok: true, snapshot_id, previewUrl });
}
