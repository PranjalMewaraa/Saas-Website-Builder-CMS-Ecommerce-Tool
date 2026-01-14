import { getMongoDb } from "./index";

export type TenantDoc = {
  _id: string;
  plan: string;
  entitlements: Record<string, boolean>;
  status: "active" | "suspended";
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
