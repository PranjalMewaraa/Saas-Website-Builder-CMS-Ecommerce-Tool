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
  listForms, // ✅ add
} from "@acme/db-mongo";
import { listAssetsForSnapshot } from "@acme/db-mongo";

function newDraftSnapshotId(site_id: string) {
  return `draft_${site_id}_${Date.now()}`;
}

function normalizeLocalOrigin(raw: string) {
  try {
    const u = new URL(raw);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      u.protocol = "http:";
    }
    return u.origin;
  } catch {
    return "http://localhost:3002";
  }
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

  await requireModule({ tenant_id, site_id, module: "builder" });

  const db = await getMongoDb();

  // typed collection so _id can be string/ObjectId without TS overload errors
  const sitesCol = db.collection<SiteDocLoose>("sites");

  const site = await sitesCol.findOne({ _id: site_id as any, tenant_id });
  if (!site) {
    return NextResponse.json(
      { ok: false, error: "Site not found" },
      { status: 404 },
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

  // ✅ include forms in snapshot
  const forms = await listForms(tenant_id, site_id);

  const snapshot_id = newDraftSnapshotId(site_id);

  const snapshot: any = {
    _id: snapshot_id,
    tenant_id,
    site_id,
    handle: site.handle,

    is_draft: true,
    version: Date.now(),
    created_by: session.user.user_id,
    created_at: new Date(),

    assets,
    previewToken: token,

    // ✅ FORMS INCLUDED (draft schema)
    forms: Object.fromEntries(
      forms.map((f: any) => [f._id, { name: f.name, schema: f.draft_schema }]),
    ),

    theme: { tokens: theme.draft_tokens, brands: theme.brand },
    stylePresets: Object.fromEntries(
      presets.map((p) => [
        p._id,
        { name: p.name, style: p.style, target: p.target },
      ]),
    ),
    menus: Object.fromEntries(
      menus.map((m) => [
        m._id,
        {
          tree: m.draft_tree,
          slot: m.slot ?? null, // ← add this
        },
      ]),
    ),
    pages: Object.fromEntries(
      pages.map((p) => [p.slug, { seo: p.seo ?? {}, layout: p.draft_layout }]),
    ),
    templates: {},
  };

  await createSnapshot(snapshot);
  await setDraftSnapshotId(tenant_id, site_id, snapshot_id);

  // ✅ IMPORTANT: preview page lives in storefront (usually :3002)
  const storefrontOrigin = normalizeLocalOrigin(
    process.env.STOREFRONT_ORIGIN || "http://localhost:3002",
  );
  const previewUrl = `${storefrontOrigin}/?handle=${encodeURIComponent(
    site.handle,
  )}&sid=${encodeURIComponent(site_id)}&token=${encodeURIComponent(token)}`;

  return NextResponse.json({ ok: true, snapshot_id, previewUrl });
}
