import InventoryManagementClient from "./InventoryManagementClient";

export default async function InventoryManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; store_id?: string }>;
}) {
  const params = await searchParams;
  const siteId = params.site_id || "";
  const storeId = params.store_id || "";

  return (
    <div className="p-6">
      <InventoryManagementClient siteId={siteId} storeId={storeId} />
    </div>
  );
}

