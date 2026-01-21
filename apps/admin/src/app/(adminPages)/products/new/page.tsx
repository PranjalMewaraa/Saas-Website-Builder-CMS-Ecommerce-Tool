import Nav from "../../_components/Nav";
import { requireSession } from "@acme/auth";
import ProductCreateClient from "./ProductCreateClient";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { site_id?: string; store_id?: string };
}) {
  await requireSession();
  const siteId = searchParams.site_id || "site_demo";
  const storeId = searchParams.store_id || "s_demo";

  return (
    <div>
      <Nav siteId={siteId} storeId={storeId} />
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create Product</h1>
        <ProductCreateClient siteId={siteId} storeId={storeId} />
      </div>
    </div>
  );
}
