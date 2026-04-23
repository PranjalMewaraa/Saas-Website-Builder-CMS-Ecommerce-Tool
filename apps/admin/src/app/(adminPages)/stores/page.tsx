import { requireSession } from "@acme/auth";
import { listStores } from "@acme/db-mysql";
import { getSite } from "@acme/db-mongo";
import Link from "next/link";
import MainStoreSelector from "./MainStoreSelector";
import StoresClient from "./StoresClient";

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
        <div>
          <h1 className="text-xl font-semibold">Stores</h1>
          <p className="text-sm text-gray-500">
            Create and manage stores. Set one main active store for this site.
          </p>
        </div>
        <Link href={"/store-setup"}>
          <button className="bg-black text-white rounded-md py-3 px-6">
            Setup New Store
          </button>
        </Link>
      </div>

      {/* ✅ Main store selector */}
      <div className="flex gap-4 items-start">
        <MainStoreSelector
          siteId={siteId}
          stores={stores}
          currentStoreId={currentStoreId}
        />

        {/* Store list + trash */}
        <div className="p-4 w-full bg-white rounded-xl shadow-sm">
          <StoresClient siteId={siteId} />
        </div>
      </div>
    </div>
  );
}
