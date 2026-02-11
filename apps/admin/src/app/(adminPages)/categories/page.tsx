import { requireSession, requireModule } from "@acme/auth";
import {
  getStore,
  listCategoryAttributes,
  listStoreCategories,
  listStores,
} from "@acme/db-mysql";
import CategoryCreateClient from "./CategoryCreateClient";
import { resolveStoreId } from "@/lib/store-scope";
import { redirect } from "next/navigation";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; store_id?: string }>;
}) {
  // ✅ Await searchParams
  const params = await searchParams;

  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const siteId = params.site_id || "site_demo";
  const storeId = await resolveStoreId({
    tenant_id,
    site_id: siteId,
    store_id: params.store_id || "",
  });

  await requireModule({ tenant_id, site_id: siteId, module: "catalog" });
  if (!params.store_id && storeId) {
    redirect(
      `/categories?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
    );
  }

  const stores = await listStores(tenant_id);
  const store = await getStore(tenant_id, storeId);
  const categories = store
    ? await listStoreCategories({ tenant_id, store_id: storeId })
    : [];
  const categoriesWithAttrs = await Promise.all(
    categories.map(async (c: any) => {
      const attrs = await listCategoryAttributes({
        tenant_id,
        store_id: storeId,
        category_id: c.id,
      });
      return { ...c, attributes: attrs };
    }),
  );

  return (
    <div>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          <p className="text-sm text-gray-500">
            Create categories and define product attributes users must fill while creating products.
          </p>
        </div>

        <CategoryCreateClient
          siteId={siteId}
          storeId={storeId}
          storePreset={(store?.industry as string | undefined) || "fashion"}
          initialCategories={categoriesWithAttrs}
          stores={stores}
        />

        {!storeId ? (
          <div className="text-sm text-gray-600">
            Select a store to manage store-scoped categories and attributes.
          </div>
        ) : null}
      </div>
    </div>
  );
}
