import { getMongoDb } from "@acme/db-mongo";

export async function rebuildDraftSnapshot(tenant_id: string, site_id: string) {
  const db = await getMongoDb();

  const sites = db.collection("sites");
  const pages = db.collection("pages");
  const forms = db.collection("forms");
  const assets = db.collection("assets");
  const menus = db.collection("menus");
  const presets = db.collection("style_presets");
  const snapshots = db.collection("snapshots");

  const site = await sites.findOne({ _id: site_id as any, tenant_id });
  if (!site) throw new Error("Site not found");

  const sitePages = await pages.find({ tenant_id, site_id }).toArray();
  const siteForms = await forms.find({ tenant_id, site_id }).toArray();
  const siteAssets = await assets.find({ tenant_id, site_id }).toArray();
  const siteMenus = await menus.find({ tenant_id, site_id }).toArray();
  const sitePresets = await presets.find({ tenant_id, site_id }).toArray();

  const snapshot = {
    tenant_id,
    site_id,
    handle: site.handle,
    is_draft: true,
    updated_at: new Date(),

    pages: sitePages.map((p) => ({
      id: p._id,
      slug: p.slug,
      layout: p.draft_layout,
      seo: p.seo ?? {},
    })),

    forms: Object.fromEntries(siteForms.map((f) => [f._id, f])),
    assets: Object.fromEntries(siteAssets.map((a) => [a._id, a])),
    menus: normalizeMenus(siteMenus),
    stylePresets: Object.fromEntries(sitePresets.map((p) => [p._id, p])),
  };

  if (site.draft_snapshot_id) {
    await snapshots.updateOne(
      { _id: site.draft_snapshot_id as any },
      { $set: snapshot },
    );
  } else {
    const res = await snapshots.insertOne(snapshot as any);
    await sites.updateOne(
      { _id: site_id as any },
      { $set: { draft_snapshot_id: res.insertedId } },
    );
  }
}

function normalizeMenus(menus: any[]) {
  const out: any = {};
  for (const m of menus) {
    if (m.slot) out[m.slot] = m;
  }
  return out;
}
