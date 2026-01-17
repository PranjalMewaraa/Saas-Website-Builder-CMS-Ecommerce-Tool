import { getMongoDb } from "./index";

export type MenuNode = {
  id: string;
  label: string;
  type: "page" | "external";
  ref: { slug?: string; href?: string };
  children: MenuNode[];
};

export type MenuDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  name: string;
  draft_tree: MenuNode[];
  published_tree: MenuNode[];
  slot?: "header" | "footer" | null;
  created_at: Date;
  updated_at: Date;
};

export async function menusCollection() {
  const db = await getMongoDb();
  return db.collection<MenuDoc>("menus");
}

export async function listMenus(tenant_id: string, site_id: string) {
  const col = await menusCollection();
  return col.find({ tenant_id, site_id }).toArray();
}

export async function getOrCreateMenu(
  tenant_id: string,
  site_id: string,
  menu_id: string,
  name: string,
) {
  const col = await menusCollection();
  const existing = await col.findOne({ _id: menu_id, tenant_id, site_id });
  if (existing) return existing;

  const doc: MenuDoc = {
    _id: menu_id,
    tenant_id,
    site_id,
    name,
    draft_tree: [],
    published_tree: [],
    slot: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  await col.insertOne(doc);
  return doc;
}

export async function updateMenuDraftTree(
  tenant_id: string,
  site_id: string,
  menu_id: string,
  tree: MenuNode[],
) {
  const col = await menusCollection();
  await col.updateOne(
    { _id: menu_id, tenant_id, site_id },
    { $set: { draft_tree: tree, updated_at: new Date() } },
  );
}

export async function publishMenu(
  tenant_id: string,
  site_id: string,
  menu_id: string,
) {
  const col = await menusCollection();
  const menu = await col.findOne({ _id: menu_id, tenant_id, site_id });
  if (!menu) throw new Error("Menu not found");

  await col.updateOne(
    { _id: menu_id },
    {
      $set: {
        published_tree: menu.draft_tree,
        updated_at: new Date(),
      },
    },
  );
}

export async function assignMenuSlot(
  tenant_id: string,
  site_id: string,
  menu_id: string,
  slot: "header" | "footer",
) {
  const col = await menusCollection();

  // Ensure only ONE menu per slot
  await col.updateMany({ tenant_id, site_id, slot }, { $set: { slot: null } });

  await col.updateOne(
    { _id: menu_id, tenant_id, site_id },
    { $set: { slot, updated_at: new Date() } },
  );
}
