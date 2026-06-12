import { getSite } from "@acme/db-mongo";
import { getStore } from "@acme/db-mysql";

/**
 * Resolves the store_id for a request, scoped to the caller's tenant.
 *
 * A client-supplied store_id is NEVER trusted blindly: it is verified to
 * belong to `tenant_id` before being returned. An unowned/unknown store_id
 * resolves to "" (fail closed) so callers' existing `if (!store_id)` guards
 * reject the request instead of operating cross-tenant.
 */
export async function resolveStoreId(args: {
  tenant_id: string;
  site_id?: string;
  store_id?: string;
}): Promise<string> {
  if (args.store_id) {
    const store = await getStore(args.tenant_id, args.store_id);
    return store ? String(store.id) : "";
  }
  if (!args.site_id) return "";
  const site = await getSite(args.site_id, args.tenant_id);
  return String(site?.store_id || "");
}
