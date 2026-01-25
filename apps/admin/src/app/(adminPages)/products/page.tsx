import Link from "next/link";
import { requireSession, requireModule } from "@acme/auth";
import { listProductsForStore } from "@acme/db-mysql";
import ProductPublishToggleClient from "./ProductPublishToggleClient";

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

  const products = await listProductsForStore({ tenant_id, store_id: storeId });

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

        <div className="space-y-2">
          {products.map((p: any) => (
            <div
              key={p.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm opacity-70">
                  {p.slug} · ${Number(p.base_price_cents / 100).toFixed(2)}
                </div>
              </div>

              <ProductPublishToggleClient
                siteId={siteId}
                storeId={storeId}
                productId={p.id}
                isPublished={!!p.is_published}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
