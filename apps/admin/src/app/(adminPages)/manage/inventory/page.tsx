import InventoryManagementClient from "./InventoryManagementClient";
import { requireSession } from "@acme/auth";
import { getSite } from "@acme/db-mongo";

export default async function InventoryManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const params = await searchParams;
  const siteId = params.site_id || "";
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const site = siteId ? await getSite(siteId, tenant_id) : null;
  const storeId = String(site?.store_id || "");

  return (
    <div className="p-6">
      <InventoryManagementClient siteId={siteId} storeId={storeId} />
    </div>
  );
}
