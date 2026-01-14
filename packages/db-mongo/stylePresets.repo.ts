import { getMongoDb } from "./index";

export type StylePresetDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  name: string;
  target?: string; // e.g. "Hero/*"
  style: any; // BaseStyle object
  created_at: Date;
  updated_at: Date;
};

export async function stylePresetsCollection() {
  const db = await getMongoDb();
  return db.collection<StylePresetDoc>("style_presets");
}

export async function listStylePresets(tenant_id: string, site_id: string) {
  const col = await stylePresetsCollection();
  return col.find({ tenant_id, site_id }).sort({ created_at: -1 }).toArray();
}

export async function upsertStylePreset(doc: StylePresetDoc) {
  const col = await stylePresetsCollection();
  await col.updateOne(
    { _id: doc._id, tenant_id: doc.tenant_id, site_id: doc.site_id },
    {
      $set: { ...doc, updated_at: new Date() },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true }
  );
}
