import { requireSession, requireModule } from "@acme/auth";
import { listBrands } from "@acme/db-mysql";
import BrandCreateClient from "./BrandCreateClient";
import BrandDeleteClient from "./BrandDeleteClient";

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: { site_id?: string; store_id?: string };
}) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const siteId = searchParams.site_id || "site_demo";
  const storeId = searchParams.store_id || "s_demo";

  await requireModule({ tenant_id, site_id: siteId, module: "catalog" });

  const brands = await listBrands(tenant_id);

  return (
    <div>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Brands</h1>

        <BrandCreateClient siteId={siteId} />

        <div className="space-y-2">
          {brands.map((b: any) => (
            <div
              key={b.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-sm opacity-70">{b.slug}</div>
              </div>
              <BrandDeleteClient siteId={siteId} brandId={b.id} />
            </div>
          ))}
          {brands.length === 0 && (
            <div className="opacity-70">No brands yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
