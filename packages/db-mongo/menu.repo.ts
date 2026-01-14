import { getMongoDb } from "./index";

export type MenuNode = {
  id: string;
  label: string;
  type: "page" | "external";
  ref: { slug?: string; href?: string };
};

export type MenuDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  name: string;
  draft_tree: MenuNode[];
  published_tree: MenuNode[];
  created_at: Date;
  updated_at: Date;
};

export async function menusCollection() {
  const db = await getMongoDb();
  return db.collection<MenuDoc>("menus");
}

export async function listMenus(tenant_id: string, site_id: string) {
  const col = await menusCollection();
  return col.find({ tenant_id, site_id }).sort({ created_at: -1 }).toArray();
}

export async function getOrCreateMenu(
  tenant_id: string,
  site_id: string,
  menu_id: string,
  name: string
) {
  const col = await menusCollection();
  const existing = await col.findOne({ _id: menu_id, tenant_id, site_id });
  if (existing) return existing;

  const doc: MenuDoc = {
    _id: menu_id,
    tenant_id,
    site_id,
    name,
    draft_tree: [
      { id: "home", label: "Home", type: "page", ref: { slug: "/" } },
    ],
    published_tree: [],
    created_at: new Date(),
    updated_at: new Date(),
  };
  await col.insertOne(doc as any);
  return doc;
}

export async function updateMenuDraftTree(
  tenant_id: string,
  site_id: string,
  menu_id: string,
  tree: MenuNode[]
) {
  const col = await menusCollection();
  await col.updateOne(
    { _id: menu_id, tenant_id, site_id },
    { $set: { draft_tree: tree, updated_at: new Date() } }
  );
}
