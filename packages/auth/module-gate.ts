import { computeEffectiveModules } from "../core/effective-modules";
import { findTenantById } from "../db-mongo/tenants.repo";
import { findSiteById } from "../db-mongo/sites.repo";
import { ModuleKey } from "../core/module";
export async function requireModule(args: {
  tenant_id: string;
  site_id: string;
  module: ModuleKey;
}) {
  const tenant = await findTenantById(args.tenant_id);
  if (!tenant) throw new Error("TENANT_NOT_FOUND");
  if (tenant.status !== "active") throw new Error("TENANT_SUSPENDED");

  const site = await findSiteById(args.site_id);
  if (!site || site.tenant_id !== args.tenant_id)
    throw new Error("SITE_NOT_FOUND");

  const effective = computeEffectiveModules({
    tenantEntitlements: tenant.entitlements as any,
    storeEnabled: site.modules_enabled as any,
  });

  if (!effective[args.module])
    throw new Error(`MODULE_DISABLED: ${args.module}`);
  return { tenant, site, effective };
}
