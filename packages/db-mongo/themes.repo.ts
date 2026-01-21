import { getMongoDb } from "./index";

export type ThemeDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  name: string;
  draft_tokens: Record<string, string>;
  published_tokens: Record<string, string>;
  created_at: Date;
  brand?: {
    logoAssetId?: string;
    logoAlt?: string;
    logoUrl?: string;
  };

  updated_at: Date;
};

export async function themesCollection() {
  const db = await getMongoDb();
  return db.collection<ThemeDoc>("themes");
}

export async function getOrCreateTheme(tenant_id: string, site_id: string) {
  const col = await themesCollection();
  const existing = await col.findOne({ tenant_id, site_id });
  if (existing) return existing;

  const doc: ThemeDoc = {
    _id: `theme_${site_id}`,
    tenant_id,
    site_id,
    name: "Default Theme",
    draft_tokens: {
      "--color-primary": "#2563EB",
      "--color-bg": "#ffffff",
      "--color-text": "#111827",
    },
    published_tokens: {},
    brand: { logoAssetId: "", logoAlt: "", logoUrl: "" },

    created_at: new Date(),
    updated_at: new Date(),
  };

  await col.insertOne(doc as any);
  return doc;
}

export async function updateThemeDraftTokens(
  tenant_id: string,
  site_id: string,
  tokens: Record<string, string>,
) {
  const col = await themesCollection();
  await col.updateOne(
    { tenant_id, site_id },
    { $set: { draft_tokens: tokens, updated_at: new Date() } },
    { upsert: true },
  );
}
export async function updateThemeBrand(
  tenant_id: string,
  site_id: string,
  brand: { logoAssetId?: string; logoAlt?: string },
) {
  const col = await themesCollection();
  await col.updateOne(
    { tenant_id, site_id },
    { $set: { brand, updated_at: new Date() } },
    { upsert: true },
  );
}
