import { getMongoDb } from "./index";

/** =========================
 *  Types
 *  ========================= */

export type SiteDoc = {
  _id: string; // string id (ex: "site_demo")
  tenant_id: string;
  store_id: string;
  name: string;
  handle: string;
  modules_enabled: Record<string, boolean>;
  domains?: Array<{ host: string; status?: string; is_primary?: boolean }>;
  published_snapshot_id?: string | null;
  active_theme_id?: string | null;
  created_at: Date;
  updated_at: Date;
};

// IMPORTANT: type SnapshotDoc with _id: string so findOne({ _id: string }) is valid.
export type SnapshotDoc = {
  _id: string; // string id (ex: "snap_demo_phase4_1")
  tenant_id: string;
  site_id: string;
  version: number;
  created_at: Date;
  created_by?: string;

  // Published bundle data (keep flexible)
  modules_effective?: Record<string, boolean>;
  theme?: { tokens?: Record<string, string> };
  stylePresets?: Record<string, { name?: string; style: any }>;
  menus?: Record<string, any>;
  pages?: Record<string, any>;
  templates?: Record<string, any>;
};

/** =========================
 *  Collections
 *  ========================= */

export async function sitesCollection() {
  const db = await getMongoDb();
  return db.collection<SiteDoc>("sites");
}

export async function snapshotsCollection() {
  const db = await getMongoDb();
  return db.collection<SnapshotDoc>("snapshots");
}

/** =========================
 *  Queries
 *  ========================= */

export async function findSiteById(site_id: string): Promise<SiteDoc | null> {
  const col = await sitesCollection();
  return col.findOne({ _id: site_id });
}

export async function findSiteByHandle(
  handle: string,
): Promise<SiteDoc | null> {
  const col = await sitesCollection();
  return col.findOne({ handle });
}

export async function findSiteByDomain(host: string): Promise<SiteDoc | null> {
  const col = await sitesCollection();
  return col.findOne({ "domains.host": host });
}

export async function findSnapshotById(
  snapshot_id: string,
): Promise<SnapshotDoc | null> {
  const col = await snapshotsCollection();
  return col.findOne({ _id: snapshot_id });
}
export async function createSite(args: {
  site_id: string;
  tenant_id: string;
  name: string;
  handle: string;
}) {
  const col = await sitesCollection();

  const doc: SiteDoc = {
    _id: args.site_id,
    tenant_id: args.tenant_id,
    store_id: `s_${Date.now()}`,
    name: args.name,
    handle: args.handle,
    modules_enabled: {
      catalog: true,
      builder: true,
      themes: true,
      menus: true,
      forms: true,
      assets: true,
      custom_entities: true,
    },
    published_snapshot_id: null,
    active_theme_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  await col.insertOne(doc);
  return doc;
}
