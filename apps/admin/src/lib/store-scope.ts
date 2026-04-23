import { getSite } from "@acme/db-mongo";

export async function resolveStoreId(args: {
  tenant_id: string;
  site_id?: string;
  store_id?: string;
}) {
  if (args.store_id) return args.store_id;
  if (!args.site_id) return "";
  const site = await getSite(args.site_id, args.tenant_id);
  return String(site?.store_id || "");
}

