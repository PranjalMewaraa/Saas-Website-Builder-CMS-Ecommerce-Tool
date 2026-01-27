import { requireSession } from "@acme/auth";
import { listStores } from "@acme/db-mysql";
import { getSite } from "@acme/db-mongo";
import Link from "next/link";
import MainStoreSelector from "./MainStoreSelector";

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const resolved = await searchParams;
  const siteId = resolved.site_id || "site_demo";

  const stores = await listStores(tenant_id);
  const site = await getSite(siteId, tenant_id);

  const currentStoreId = site?.store_id || "";

  return (
    <div className="p-6 space-y-6">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-xl font-semibold">Stores</h1>
        <Link href={"/store-setup"}>
          <button className="bg-black text-white rounded-md py-3 px-6">
            Setup New Store
          </button>
        </Link>
      </div>

      {/* ✅ Main store selector */}
      <MainStoreSelector
        siteId={siteId}
        stores={stores}
        currentStoreId={currentStoreId}
      />

      {/* Existing store list */}
      <div className="space-y-2 pt-4">
        {stores.map((s) => (
          <div
            key={s.id}
            className="border rounded p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm opacity-70">
                Type: {s.store_type} · ID: {s.id}
              </div>
            </div>

            <Link
              className="px-3 py-2 rounded bg-black text-white"
              href={`/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(
                s.id,
              )}`}
            >
              Manage Catalog
            </Link>
          </div>
        ))}

        {stores.length === 0 && (
          <div className="opacity-70">No stores found.</div>
        )}
      </div>
    </div>
  );
}
