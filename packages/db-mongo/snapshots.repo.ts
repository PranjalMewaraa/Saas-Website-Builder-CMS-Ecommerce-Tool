import { getMongoDb, snapshotsCollection } from "./index";

export async function createSnapshot(snapshot: any) {
  const col = await snapshotsCollection();
  await col.insertOne(snapshot);
  return snapshot;
}

/**
 * Returns the next monotonic version number for a site's snapshots.
 * Replaces Date.now()-based versions, which could collide under the unique
 * {tenant_id, site_id, version} index when two publishes land in the same ms.
 */
export async function getNextSnapshotVersion(
  tenant_id: string,
  site_id: string,
): Promise<number> {
  const col = await snapshotsCollection();
  const latest = await col
    .find({ tenant_id, site_id, is_draft: { $ne: true } } as any)
    .sort({ version: -1 })
    .limit(1)
    .toArray();
  const max = latest[0]?.version ?? 0;
  return Number(max) + 1;
}

/**
 * Retains the `keep` most recent published snapshots for a site and deletes
 * older ones, never deleting the currently published snapshot or drafts.
 */
export async function pruneSnapshots(args: {
  tenant_id: string;
  site_id: string;
  keep: number;
  keepId?: string | null;
}): Promise<number> {
  const { tenant_id, site_id, keep } = args;
  const col = await snapshotsCollection();

  const recent = await col
    .find({ tenant_id, site_id, is_draft: { $ne: true } } as any)
    .sort({ version: -1 })
    .limit(keep)
    .project({ _id: 1 })
    .toArray();

  const keepIds = new Set<string>(recent.map((s) => String(s._id)));
  if (args.keepId) keepIds.add(String(args.keepId));

  const res = await col.deleteMany({
    tenant_id,
    site_id,
    is_draft: { $ne: true },
    _id: { $nin: Array.from(keepIds) },
  } as any);

  return res.deletedCount ?? 0;
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
