import Link from "next/link";
import { requireSession, requireModule } from "@acme/auth";
import { getStore } from "@acme/db-mysql";
import { buttonClass } from "@acme/ui";
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
  const store = storeId ? await getStore(tenant_id, storeId) : null;
  const storeLabel = store?.name || (storeId ? `Store ${storeId.slice(-6)}` : "—");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted">
            Store: <span className="font-medium text-ink">{storeLabel}</span> ·
            manage publish state and product details.
          </p>
        </div>

        <Link
          className={buttonClass({ variant: "accent" })}
          href={
            catalogId
              ? `/products/new?site_id=${siteId}&catalog_id=${encodeURIComponent(catalogId)}`
              : `/products/new?site_id=${siteId}&store_id=${storeId}`
          }
        >
          New product
        </Link>
      </div>

      <ProductsClient siteId={siteId} storeId={storeId} catalogId={catalogId} />
    </div>
  );
}
