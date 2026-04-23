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
    <div className="min-h-screen bg-[#F5F5F7] font-sans antialiased text-[#1D1D1F]">
      {/* Dynamic Header Section */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <nav className="text-[12px] font-medium tracking-tight text-blue-600 uppercase mb-2">
              Catalog Management
            </nav>
            <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F]">
              Categories
            </h1>
            <p className="max-w-md text-[17px] leading-relaxed text-[#86868B] font-medium">
              Define the structure of your store and the attributes that make
              your products unique.
            </p>
          </div>

          {/* Visual Indicator of Store Context */}
          {store && (
            <div className="px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold tracking-tight">
                {store.name}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl bg-white p-4 mx-auto ">
        {/* Main Interaction Card */}
        <section className="bg-white rounded-[28px]  overflow-hidden transition-all duration-500 ">
          <div className="p-1">
            <CategoryCreateClient
              siteId={siteId}
              storeId={storeId}
              storePreset={(store?.industry as string | undefined) || "fashion"}
              initialCategories={categoriesWithAttrs}
              stores={stores}
            />
          </div>
        </section>

        {/* Empty State / Hint */}
        {!storeId && (
          <div className="mt-12 text-center py-20 rounded-[28px] border-2 border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-400">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">
              No Store Selected
            </h3>
            <p className="text-[#86868B] mt-1">
              Select a store from the menu to manage categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
