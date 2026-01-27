import { getMongoDb } from "./index";

function randomToken(len = 32) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function ensureSitePreviewToken(
  tenant_id: string,
  site_id: string,
) {
  const db = await getMongoDb();
  const sites = db.collection("sites");

  const site = await sites.findOne({ _id: site_id, tenant_id });
  if (!site) throw new Error("SITE_NOT_FOUND");

  if (site.preview_token) return site.preview_token as string;

  const token = randomToken(40);
  await sites.updateOne(
    { _id: site_id, tenant_id },
    { $set: { preview_token: token, updated_at: new Date() } },
  );
  return token;
}
export async function regenerateSitePreviewToken(
  tenant_id: string,
  site_id: string,
) {
  const db = await getMongoDb();
  const sites = db.collection("sites");

  const site = await sites.findOne({ _id: site_id, tenant_id });
  if (!site) throw new Error("SITE_NOT_FOUND");

  const token = randomToken(40);
  await sites.updateOne(
    { _id: site_id, tenant_id },
    { $set: { preview_token: token, updated_at: new Date() } },
  );
  return token;
}

export async function setDraftSnapshotId(
  tenant_id: string,
  site_id: string,
  snapshot_id: string | null,
) {
  const db = await getMongoDb();
  await db
    .collection("sites")
    .updateOne(
      { _id: site_id, tenant_id },
      { $set: { draft_snapshot_id: snapshot_id, updated_at: new Date() } },
    );
}

export async function getSiteByHandle(handle: string) {
  console.log(handle);
  const db = await getMongoDb();
  return db.collection("sites").findOne({ handle });
}

export async function getSnapshotById(snapshot_id: string) {
  const db = await getMongoDb();
  return db.collection("snapshots").findOne({ _id: snapshot_id });
}
