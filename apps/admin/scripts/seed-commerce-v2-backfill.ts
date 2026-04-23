import {
  ensureLegacyBrandForStore,
  ensureStoreProfile,
  getStorePreset,
  listStoreTypePresets,
  seedStorePreset,
  pool,
  type StorePresetKey,
} from "@acme/db-mysql";

type StoreRow = {
  id: string;
  tenant_id: string;
  name: string;
  industry: string | null;
};

function pickPreset(store: StoreRow): StorePresetKey {
  const text = `${store.industry ?? ""} ${store.name ?? ""}`.toLowerCase();
  if (/(fashion|apparel|clothing|shoe)/.test(text)) return "fashion";
  if (/(electronic|laptop|mobile|phone|tech)/.test(text)) return "electronics";
  if (/(grocery|food)/.test(text)) return "grocery";
  if (/(beauty|cosmetic|skincare)/.test(text)) return "beauty_cosmetics";
  if (/(furniture|home|decor)/.test(text)) return "home_furniture";
  if (/(sport|fitness|gym)/.test(text)) return "sports_fitness";
  if (/(auto|car|bike)/.test(text)) return "automotive";
  if (/(book|stationery)/.test(text)) return "books_stationery";
  if (/(jewel)/.test(text)) return "jewelry";
  if (/(toy)/.test(text)) return "toys";
  if (/(pet)/.test(text)) return "pet_supplies";
  if (/(digital|software|saas)/.test(text)) return "digital_products";
  if (/(handmade|craft)/.test(text)) return "handmade_crafts";
  if (/(pharmacy|medicine)/.test(text)) return "pharmacy";
  if (/(hardware|tool)/.test(text)) return "hardware_tools";
  return "fashion";
}

async function run() {
  const withPresets = process.argv.includes("--with-presets");
  const dryRun = process.argv.includes("--dry-run");

  const [rows] = await pool.query<any[]>(
    `SELECT id, tenant_id, name, industry FROM stores WHERE status <> 'archived'`,
  );
  const stores = rows as StoreRow[];

  let profiles = 0;
  let legacyBrands = 0;
  let presetSeeds = 0;

  for (const store of stores) {
    const preset = pickPreset(store);
    if (!dryRun) {
      await ensureStoreProfile({
        tenant_id: store.tenant_id,
        store_id: store.id,
        store_preset: preset,
      });
      profiles += 1;
    }

    // Make sure each store has at least one mapped brand for v2 flows.
    const [hasBrandProfileRows] = await pool.query<any[]>(
      `SELECT 1
       FROM brand_profiles
       WHERE tenant_id = ? AND store_id = ?
       LIMIT 1`,
      [store.tenant_id, store.id],
    );
    if (!hasBrandProfileRows.length) {
      if (!dryRun) {
        await ensureLegacyBrandForStore({ tenant_id: store.tenant_id, store_id: store.id });
      }
      legacyBrands += 1;
    }

    // Optional: seed categories/attributes once per store if none exist.
    if (withPresets) {
      const [existingCats] = await pool.query<any[]>(
        `SELECT 1 FROM store_categories WHERE tenant_id = ? AND store_id = ? LIMIT 1`,
        [store.tenant_id, store.id],
      );
      if (!existingCats.length && getStorePreset(preset)) {
        if (!dryRun) {
          await seedStorePreset({
            tenant_id: store.tenant_id,
            store_id: store.id,
            preset,
          });
        }
        presetSeeds += 1;
      }
    }
  }

  console.log("Commerce v2 backfill complete");
  console.log({
    stores: stores.length,
    profiles_upserted: profiles,
    legacy_brands_created: legacyBrands,
    preset_seeded_stores: presetSeeds,
    withPresets,
    dryRun,
    presetKeys: listStoreTypePresets().map((p) => p.key),
  });
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

