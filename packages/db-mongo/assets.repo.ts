import { getMongoDb } from "./index";

export type AssetDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  kind: "image" | "file";
  url: string;
  key: string; // object storage key
  mime: string;
  size_bytes: number;
  width?: number;
  height?: number;
  alt?: string;
  tags?: string[];
  folder?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  is_deleted?: boolean;
};

export async function assetsCollection() {
  const db = await getMongoDb();
  return db.collection<AssetDoc>("assets_meta");
}

export async function createAsset(doc: AssetDoc) {
  const col = await assetsCollection();
  await col.insertOne(doc as any);
  return doc;
}

export async function listAssets(tenant_id: string, site_id: string) {
  const col = await assetsCollection();
  return col
    .find({ tenant_id, site_id, is_deleted: { $ne: true } })
    .sort({ created_at: -1 })
    .toArray();
}

export async function updateAssetAlt(
  tenant_id: string,
  site_id: string,
  asset_id: string,
  alt: string
) {
  const col = await assetsCollection();
  await col.updateOne(
    { _id: asset_id, tenant_id, site_id },
    { $set: { alt, updated_at: new Date() } }
  );
}

export async function softDeleteAsset(
  tenant_id: string,
  site_id: string,
  asset_id: string
) {
  const col = await assetsCollection();
  await col.updateOne(
    { _id: asset_id, tenant_id, site_id },
    { $set: { is_deleted: true, updated_at: new Date() } }
  );
}
export async function listAssetsForSnapshot(
  tenant_id: string,
  site_id: string
) {
  const col = await assetsCollection();
  const docs = await col
    .find({ tenant_id, site_id, is_deleted: { $ne: true } })
    .project({ _id: 1, key: 1, url: 1, alt: 1, width: 1, height: 1, mime: 1 })
    .toArray();

  const entries: [string, any][] = [];
  for (const a of docs as any[]) {
    const value = {
      url: a.url,
      alt: a.alt || "",
      width: a.width,
      height: a.height,
      mime: a.mime,
    };
    if (a._id) entries.push([a._id, value]);
    if (a.key && a.key !== a._id) entries.push([a.key, value]);
  }
  return Object.fromEntries(entries);
}
