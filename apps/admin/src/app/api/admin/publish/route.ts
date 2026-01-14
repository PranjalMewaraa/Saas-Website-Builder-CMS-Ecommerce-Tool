import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../packages/auth";
import {
  getOrCreateTheme,
  listMenus,
  listPages,
  listStylePresets,
  createSnapshot,
  getMongoDb,
} from "../../../../../../../packages/db-mongo";
import { listAssetsForSnapshot } from "@acme/db-mongo";
import { listForms } from "@acme/db-mongo";

function newSnapshotId(site_id: string) {
  return `snap_${site_id}_${Date.now()}`;
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

  const theme = await getOrCreateTheme(tenant_id, site_id);
  const menus = await listMenus(tenant_id, site_id);
  const pages = await listPages(tenant_id, site_id);
  const presets = await listStylePresets(tenant_id, site_id);
  const assets = await listAssetsForSnapshot(tenant_id, site_id);
  const forms = await listForms(tenant_id, site_id);

  // ✅ FIX: Use a loosely typed collection so _id can be string/ObjectId without TS overload errors
  const sitesCol = db.collection<SiteDocLoose>("sites");

  const site = await sitesCol.findOne({ _id: site_id as any, tenant_id });
  if (!site) {
    return NextResponse.json(
      { ok: false, error: "Site not found" },
      { status: 404 }
    );
  }

  const brandLogoAssetId = theme.brand?.logoAssetId;
  const brandLogo =
    brandLogoAssetId && assets[brandLogoAssetId]
      ? {
          logoAssetId: brandLogoAssetId,
          logoUrl: assets[brandLogoAssetId].url,
          logoAlt:
            theme.brand?.logoAlt || assets[brandLogoAssetId].alt || "Logo",
        }
      : {
          logoAssetId: brandLogoAssetId || "",
          logoUrl: "",
          logoAlt: theme.brand?.logoAlt || "",
        };

  const snapshot_id = newSnapshotId(site_id);

  const snapshot: any = {
    _id: snapshot_id,
    tenant_id,
    site_id,

    handle: site.handle, // ✅ published snapshot will carry handle
    assets,
    brand: brandLogo,
    forms: Object.fromEntries(
      forms.map((f) => [f._id, { name: f.name, schema: f.draft_schema }])
    ),

    version: Date.now(),
    created_by: session.user.user_id,
    created_at: new Date(),

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

  // ✅ FIX: same typing approach for updateOne
  await sitesCol.updateOne(
    { _id: site_id as any, tenant_id },
    { $set: { published_snapshot_id: snapshot_id, updated_at: new Date() } }
  );

  return NextResponse.json({ ok: true, snapshot_id });
}
