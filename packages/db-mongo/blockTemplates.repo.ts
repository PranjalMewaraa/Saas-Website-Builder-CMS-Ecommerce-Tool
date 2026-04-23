import { getMongoDb } from "./index";

export type BlockTemplateScope = "site" | "tenant";

export type BlockTemplateDoc = {
  _id: string;
  tenant_id: string;
  site_id?: string;
  scope: BlockTemplateScope;
  name: string;
  category?: string;
  tags: string[];
  block: { id: string; type: string; props: any; style?: any };
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  is_deleted?: boolean;
};

export async function blockTemplatesCollection() {
  const db = await getMongoDb();
  return db.collection<BlockTemplateDoc>("block_templates");
}

export async function listBlockTemplatesForSite(
  tenant_id: string,
  site_id: string,
) {
  const col = await blockTemplatesCollection();
  return col
    .find({
      tenant_id,
      is_deleted: { $ne: true },
      $or: [{ scope: "tenant" }, { scope: "site", site_id }],
    })
    .sort({ created_at: -1 })
    .toArray();
}

export async function createBlockTemplate(doc: BlockTemplateDoc) {
  const col = await blockTemplatesCollection();
  await col.insertOne(doc as any);
  return doc;
}

export async function updateBlockTemplateMeta(args: {
  tenant_id: string;
  template_id: string;
  name?: string;
  category?: string;
  tags?: string[];
}) {
  const col = await blockTemplatesCollection();
  await col.updateOne(
    { _id: args.template_id, tenant_id: args.tenant_id },
    {
      $set: {
        ...(args.name != null ? { name: args.name } : {}),
        ...(args.category != null ? { category: args.category } : {}),
        ...(args.tags ? { tags: args.tags } : {}),
        updated_at: new Date(),
      },
    },
  );
}

export async function softDeleteBlockTemplate(args: {
  tenant_id: string;
  site_id: string;
  template_id: string;
}) {
  const col = await blockTemplatesCollection();
  const tpl = await col.findOne({
    _id: args.template_id,
    tenant_id: args.tenant_id,
  });
  if (!tpl) return;
  if (tpl.scope === "site" && tpl.site_id !== args.site_id) {
    throw new Error("TEMPLATE_SITE_MISMATCH");
  }
  await col.updateOne(
    { _id: args.template_id, tenant_id: args.tenant_id },
    { $set: { is_deleted: true, updated_at: new Date() } },
  );
}
