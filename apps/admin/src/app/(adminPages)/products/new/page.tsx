import { requireSession } from "@acme/auth";
import ProductCreateClient from "./ProductCreateClient";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; store_id?: string }>;
}) {
  // ✅ Await searchParams
  const params = await searchParams;

  await requireSession();

  const siteId = params.site_id || "site_demo";
  const storeId = params.store_id || "s_demo";

  return (
    <div>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create Product</h1>
        <ProductCreateClient siteId={siteId} storeId={storeId} />
      </div>
    </div>
  );
}
