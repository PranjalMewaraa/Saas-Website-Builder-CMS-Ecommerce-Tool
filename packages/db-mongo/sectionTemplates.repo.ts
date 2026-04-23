import { getMongoDb } from "./index";

export type SectionTemplateScope = "site" | "tenant";

export type SectionTemplateDoc = {
  _id: string;
  tenant_id: string;

  // when scope = "site", site_id is required
  // when scope = "tenant", site_id is optional/absent
  site_id?: string;

  scope: SectionTemplateScope;

  name: string;
  category?: string;
  tags: string[];

  section: {
    label?: string;
    style?: any;
    blocks: Array<{ id: string; type: string; props: any; style?: any }>;
  };

  created_by?: string;
  created_at: Date;
  updated_at: Date;
  is_deleted?: boolean;
};

export async function sectionTemplatesCollection() {
  const db = await getMongoDb();
  return db.collection<SectionTemplateDoc>("section_templates");
}

/** Returns templates available for a site: tenant-wide + site-scoped */
export async function listTemplatesForSite(tenant_id: string, site_id: string) {
  const col = await sectionTemplatesCollection();
  return col
    .find({
      tenant_id,
      is_deleted: { $ne: true },
      $or: [{ scope: "tenant" }, { scope: "site", site_id }],
    })
    .sort({ created_at: -1 })
    .toArray();
}

export async function getTemplateById(tenant_id: string, template_id: string) {
  const col = await sectionTemplatesCollection();
  return col.findOne({
    _id: template_id,
    tenant_id,
    is_deleted: { $ne: true },
  });
}

export async function createSectionTemplate(doc: SectionTemplateDoc) {
  const col = await sectionTemplatesCollection();
  await col.insertOne(doc as any);
  return doc;
}

export async function updateSectionTemplateMeta(args: {
  tenant_id: string;
  template_id: string;
  name?: string;
  category?: string;
  tags?: string[];
}) {
  const col = await sectionTemplatesCollection();
  await col.updateOne(
    { _id: args.template_id, tenant_id: args.tenant_id },
    {
      $set: {
        ...(args.name != null ? { name: args.name } : {}),
        ...(args.category != null ? { category: args.category } : {}),
        ...(args.tags ? { tags: args.tags } : {}),
        updated_at: new Date(),
      },
    }
  );
}

/** Soft delete. For site templates, require site match. For tenant templates, ignore site. */
export async function softDeleteTemplate(args: {
  tenant_id: string;
  site_id: string; // caller context (auth/module gating)
  template_id: string;
}) {
  const col = await sectionTemplatesCollection();
  const tpl = await col.findOne({
    _id: args.template_id,
    tenant_id: args.tenant_id,
  });

  if (!tpl) return;

  // if site-scoped, enforce same site
  if (tpl.scope === "site" && tpl.site_id !== args.site_id) {
    throw new Error("TEMPLATE_SITE_MISMATCH");
  }

  await col.updateOne(
    { _id: args.template_id, tenant_id: args.tenant_id },
    { $set: { is_deleted: true, updated_at: new Date() } }
  );
}
