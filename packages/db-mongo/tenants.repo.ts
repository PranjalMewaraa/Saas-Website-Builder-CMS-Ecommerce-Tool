import { getMongoDb } from "./index";
export type TenantOnboarding = {
  completed: boolean;
  step: "welcome" | "create-site" | "done";
  site_id?: string;
};
export type TenantDoc = {
  _id: string;
  plan: string;
  entitlements: Record<string, boolean>;
  status: "active" | "suspended";
  onboarding?: TenantOnboarding; // ✅ ADD
  created_at: Date;
  updated_at: Date;
};

export async function tenantsCollection() {
  const db = await getMongoDb();
  return db.collection<TenantDoc>("tenants");
}

export async function findTenantById(tenant_id: string) {
  const col = await tenantsCollection();
  return col.findOne({ _id: tenant_id });
}
export async function createTenant(args: { tenant_id: string; plan?: string }) {
  const col = await tenantsCollection();

  const doc: TenantDoc = {
    _id: args.tenant_id,
    plan: args.plan || "free",
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
    onboarding: {
      completed: false,
      step: "welcome",
    },
    created_at: new Date(),
    updated_at: new Date(),
  };

  await col.insertOne(doc);
  return doc;
}

export async function updateTenantOnboarding(
  tenant_id: string,
  data: Partial<TenantOnboarding>,
) {
  const col = await tenantsCollection();

  await col.updateOne(
    { _id: tenant_id },
    {
      $set: {
        "onboarding.completed": data.completed,
        "onboarding.step": data.step,
        "onboarding.site_id": data.site_id,
        updated_at: new Date(),
      },
    },
  );
}
