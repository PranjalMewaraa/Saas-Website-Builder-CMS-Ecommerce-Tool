import Link from "next/link";
import { requireSession, requireModule } from "@acme/auth";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; store_id?: string }>;
}) {
  // ✅ Await searchParams
  const params = await searchParams;

  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const siteId = params.site_id || "site_demo";
  const storeId = params.store_id || "s_demo";

  // Gate UI too (optional but recommended for consistency)
  await requireModule({ tenant_id, site_id: siteId, module: "catalog" });

  return (
    <div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Products</h1>

          <Link
            className="px-3 py-2 rounded bg-black text-white"
            href={`/products/new?site_id=${siteId}&store_id=${storeId}`}
          >
            New Product
          </Link>
        </div>

        <ProductsClient siteId={siteId} storeId={storeId} />
      </div>
    </div>
  );
}
