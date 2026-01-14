// apps/admin/scripts/seed-tenant-site.ts
import { getMongoDb } from "@acme/db-mongo";

type TenantDoc = {
  _id: string; // <-- string ID
  plan: string;
  entitlements: Record<string, boolean>;
  status: "active" | "suspended";
  created_at: Date;
  updated_at: Date;
};

type SiteDoc = {
  _id: string; // <-- string ID
  tenant_id: string;
  store_id: string;
  name: string;
  handle: string;
  modules_enabled: Record<string, boolean>;
  published_snapshot_id: string | null;
  updated_at: Date;
  created_at: Date;
};

async function run() {
  const db = await getMongoDb();

  // IMPORTANT: type the collections so _id is string, not ObjectId
  const tenants = db.collection<TenantDoc>("tenants");
  const sites = db.collection<SiteDoc>("sites");

  await tenants.updateOne(
    { _id: "t_demo" },
    {
      $set: {
        _id: "t_demo",
        plan: "pro",
        entitlements: {
          catalog: true,
          builder: true,
          themes: true,
          menus: true,
          forms: true,
          assets: true,
          custom_entities: true,
          checkout: false,
          promotions: false,
        },
        status: "active",
        updated_at: new Date(),
      },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true }
  );

  await sites.updateOne(
    { _id: "site_demo" },
    {
      $set: {
        _id: "site_demo",
        tenant_id: "t_demo",
        store_id: "s_demo",
        name: "Demo Site",
        handle: "demo-site",
        modules_enabled: {
          catalog: true,
          builder: true,
          themes: true,
          menus: true,
          forms: true,
          assets: true,
          custom_entities: true,
        },
        published_snapshot_id: null,
        updated_at: new Date(),
      },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true }
  );

  console.log("Seeded tenant + site:", {
    tenant_id: "t_demo",
    site_id: "site_demo",
  });
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
