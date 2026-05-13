import { getMongoDb } from "./index";

export type PageRevisionDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  page_id: string;
  slug: string;
  name?: string | null;
  layout: any;
  seo?: any;
  actor_user_id: string;
  actor_name?: string | null;
  note?: string | null;
  created_at: Date;
};

const MAX_KEEP = 50;

async function revisionsCollection() {
  const db = await getMongoDb();
  return db.collection<PageRevisionDoc>("page_revisions");
}

function newRevisionId(page_id: string) {
  return `rev_${page_id}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
}

export async function createPageRevision(args: {
  tenant_id: string;
  site_id: string;
  page_id: string;
  slug: string;
  name?: string | null;
  layout: any;
  seo?: any;
  actor_user_id: string;
  actor_name?: string | null;
  note?: string | null;
}): Promise<PageRevisionDoc> {
  const col = await revisionsCollection();
  const doc: PageRevisionDoc = {
    _id: newRevisionId(args.page_id),
    tenant_id: args.tenant_id,
    site_id: args.site_id,
    page_id: args.page_id,
    slug: args.slug,
    name: args.name ?? null,
    layout: args.layout,
    seo: args.seo ?? null,
    actor_user_id: args.actor_user_id,
    actor_name: args.actor_name ?? null,
    note: args.note ?? null,
    created_at: new Date(),
  };
  await col.insertOne(doc as any);
  await pruneOldRevisions({
    tenant_id: args.tenant_id,
    site_id: args.site_id,
    page_id: args.page_id,
    keep: MAX_KEEP,
  });
  return doc;
}

export async function listPageRevisions(args: {
  tenant_id: string;
  site_id: string;
  page_id: string;
  limit?: number;
  offset?: number;
}): Promise<PageRevisionDoc[]> {
  const col = await revisionsCollection();
  const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
  const offset = Math.max(args.offset ?? 0, 0);
  const rows = await col
    .find({
      tenant_id: args.tenant_id,
      site_id: args.site_id,
      page_id: args.page_id,
    })
    .sort({ created_at: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
  return rows as PageRevisionDoc[];
}

export async function getPageRevision(args: {
  tenant_id: string;
  revision_id: string;
}): Promise<PageRevisionDoc | null> {
  const col = await revisionsCollection();
  const doc = await col.findOne({
    _id: args.revision_id as any,
    tenant_id: args.tenant_id,
  } as any);
  return (doc as PageRevisionDoc) ?? null;
}

export async function pruneOldRevisions(args: {
  tenant_id: string;
  site_id: string;
  page_id: string;
  keep: number;
}): Promise<void> {
  const col = await revisionsCollection();
  const keep = Math.max(1, args.keep);
  const cursor = col
    .find({
      tenant_id: args.tenant_id,
      site_id: args.site_id,
      page_id: args.page_id,
    })
    .project({ _id: 1 })
    .sort({ created_at: -1 })
    .skip(keep);
  const toDelete: string[] = [];
  for await (const d of cursor) {
    toDelete.push((d as any)._id);
  }
  if (toDelete.length) {
    await col.deleteMany({ _id: { $in: toDelete as any[] } } as any);
  }
}
