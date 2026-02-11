import Link from "next/link";
import { requireSession, requireModule } from "@acme/auth";
import ProductsClient from "./ProductsClient";
import { resolveStoreId } from "@/lib/store-scope";
import { redirect } from "next/navigation";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; store_id?: string; catalog_id?: string }>;
}) {
  // ✅ Await searchParams
  const params = await searchParams;

  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const siteId = params.site_id || "site_demo";
  const catalogId = params.catalog_id || "";
  const storeId =
    catalogId ||
    (await resolveStoreId({
      tenant_id,
      site_id: siteId,
      store_id: params.store_id || "",
    }));

  // Gate UI too (optional but recommended for consistency)
  await requireModule({ tenant_id, site_id: siteId, module: "catalog" });
  if (!params.store_id && !params.catalog_id && storeId) {
    redirect(
      `/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
    );
  }

  return (
    <div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Products</h1>
            <div className="text-xs text-gray-500">
              Store: <span className="font-mono">{storeId || "-"}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Add products for this store, manage publish state, and edit inventory-ready details.
            </p>
          </div>

          <Link
            className="px-3 py-2 rounded bg-black text-white"
            href={
              catalogId
                ? `/products/new?site_id=${siteId}&catalog_id=${encodeURIComponent(catalogId)}`
                : `/products/new?site_id=${siteId}&store_id=${storeId}`
            }
          >
            New Product
          </Link>
        </div>

        <ProductsClient siteId={siteId} storeId={storeId} catalogId={catalogId} />
      </div>
    </div>
  );
}
