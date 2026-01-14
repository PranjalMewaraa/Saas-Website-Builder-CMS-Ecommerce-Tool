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
} from "../../../../../../../packages/db-mongo";
import { getMongoDb } from "../../../../../../../packages/db-mongo";

function newSnapshotId(site_id: string) {
  return `snap_${site_id}_${Date.now()}`;
}

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

  const snapshot_id = newSnapshotId(site_id);

  const snapshot: any = {
    _id: snapshot_id,
    tenant_id,
    site_id,
    version: Date.now(), // MVP: timestamp version; later increment
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

  // update site pointer
  await db
    .collection("sites")
    .updateOne({ _id: site_id as any, tenant_id } as any, {
      $set: { published_snapshot_id: snapshot_id, updated_at: new Date() },
    });

  return NextResponse.json({ ok: true, snapshot_id });
}
