import { requireSession, requireModule } from "@acme/auth";
import { getStore, listBrandsByStore, listStores } from "@acme/db-mysql";
import BrandCreateClient from "./BrandCreateClient";

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; store_id?: string }>;
}) {
  // ✅ Await searchParams
  const params = await searchParams;

  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const siteId = params.site_id || "site_demo";
  const storeId = params.store_id || "";

  await requireModule({ tenant_id, site_id: siteId, module: "catalog" });

  const stores = await listStores(tenant_id);
  const store = await getStore(tenant_id, storeId);
  const brands = store
    ? await listBrandsByStore({ tenant_id, store_id: storeId })
    : [];

  return (
    <div>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Brands</h1>

        <BrandCreateClient
          siteId={siteId}
          storeId={storeId}
          storeType={(store?.store_type as "brand" | "distributor" | undefined) || "brand"}
          initialBrands={brands}
          stores={stores}
        />

        {!storeId ? (
          <div className="text-sm text-gray-600">
            Select a store to manage store-scoped brands/distributors.
          </div>
        ) : null}
      </div>
    </div>
  );
}
