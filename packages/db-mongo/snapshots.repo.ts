import { getMongoDb, snapshotsCollection } from "./index";

export async function createSnapshot(snapshot: any) {
  const col = await snapshotsCollection();
  await col.insertOne(snapshot);
  return snapshot;
}
export async function updateDraftSiteSeo(
  tenant_id: string,
  site_id: string,
  siteSeo: any,
) {
  const col = await snapshotsCollection();
  await col.updateOne(
    { tenant_id, site_id, is_draft: true },
    { $set: { site_seo: siteSeo } },
  );
}

export async function updateDraftPageSeo(
  tenant_id: string,
  site_id: string,
  slug: string,
  pageSeo: any,
) {
  const col = await snapshotsCollection();
  await col.updateOne(
    { tenant_id, site_id, is_draft: true },
    {
      $set: {
        [`pages.${slug}.seo`]: pageSeo,
      },
    },
  );
}
