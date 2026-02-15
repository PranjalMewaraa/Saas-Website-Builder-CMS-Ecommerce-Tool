import { requireSession } from "@acme/auth";
import ProductCreateClient from "./ProductCreateClient";
import { resolveStoreId } from "@/lib/store-scope";
import { redirect } from "next/navigation";

export default async function NewProductPage({
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
  if (!params.store_id && !params.catalog_id && storeId) {
    redirect(
      `/products/new?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
    );
  }

  return (
    <div>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create Product</h1>
        <ProductCreateClient siteId={siteId} storeId={storeId} catalogId={catalogId} />
      </div>
    </div>
  );
}
