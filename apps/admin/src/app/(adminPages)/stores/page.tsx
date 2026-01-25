import { requireSession } from "@acme/auth";
import { listStores } from "@acme/db-mysql";
import Link from "next/link";

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const resolvedSearchParams = await searchParams;
  const siteId = resolvedSearchParams.site_id || "site_demo";
  const stores = await listStores(tenant_id);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Select a Store</h1>
      <div className="space-y-2">
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
              href={`/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(s.id)}`}
            >
              Manage Catalog
            </Link>
          </div>
        ))}
        {stores.length === 0 && (
          <div className="opacity-70">
            No stores found. (You seeded s_demo in Phase 2.)
          </div>
        )}
      </div>
    </div>
  );
}
