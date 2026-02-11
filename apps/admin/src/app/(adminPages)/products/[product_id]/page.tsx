import { requireSession, requireModule } from "@acme/auth";
import { getProduct, getProductV2, listProductCategoryIds } from "@acme/db-mysql";
import ProductEditClient from "./productEditClient";

export default async function ProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ product_id: string }>;
  searchParams: Promise<{ site_id?: string; store_id?: string }>;
}) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { product_id } = await params;
  const sp = await searchParams;
  const siteId = sp.site_id || "site_demo";
  const storeId = sp.store_id || "";

  await requireModule({ tenant_id, site_id: siteId, module: "catalog" });

  let product: any = null;
  if (storeId) {
    product = await getProductV2({ tenant_id, store_id: storeId, product_id });
  }
  if (!product) {
    const legacy = await getProduct(tenant_id, product_id);
    const categoryIds = legacy
      ? await listProductCategoryIds(tenant_id, product_id)
      : [];
    product = legacy ? { ...legacy, category_ids: categoryIds } : null;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Edit Product</h1>
      <ProductEditClient
        siteId={siteId}
        storeId={storeId}
        product={product}
      />
    </div>
  );
}
