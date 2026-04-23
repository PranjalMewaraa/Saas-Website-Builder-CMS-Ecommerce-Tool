import { getMongoDb } from "./index";

export type PageDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  slug: string; // "/"
  title: string;
  draft_layout: any; // PageLayout JSON
  seo?: { title?: string; description?: string };
  created_at: Date;
  updated_at: Date;
};

export async function pagesCollection() {
  const db = await getMongoDb();
  return db.collection<PageDoc>("pages");
}

export async function listPages(tenant_id: string, site_id: string) {
  const col = await pagesCollection();
  return col.find({ tenant_id, site_id }).sort({ slug: 1 }).toArray();
}

export async function getOrCreateHomePage(tenant_id: string, site_id: string) {
  const col = await pagesCollection();
  const existing = await col.findOne({ tenant_id, site_id, slug: "/" });
  if (existing) return existing;

  const doc: PageDoc = {
    _id: `page_${site_id}_home`,
    tenant_id,
    site_id,
    slug: "/",
    title: "Home",
    draft_layout: {
      version: 1,
      sections: [{ id: "sec_home", blocks: [] }],
    },
    seo: { title: "Home", description: "" },
    created_at: new Date(),
    updated_at: new Date(),
  };

  await col.insertOne(doc as any);
  return doc;
}

export async function updatePageDraftLayout(
  tenant_id: string,
  site_id: string,
  page_id: string,
  layout: any
) {
  const col = await pagesCollection();
  await col.updateOne(
    { _id: page_id, tenant_id, site_id },
    { $set: { draft_layout: layout, updated_at: new Date() } }
  );
}
