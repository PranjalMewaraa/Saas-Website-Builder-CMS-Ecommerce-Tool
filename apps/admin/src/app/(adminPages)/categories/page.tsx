import { requireSession, requireModule } from "@acme/auth";
import { listCategories } from "@acme/db-mysql";
import CategoryCreateClient from "./CategoryCreateClient";
import CategoryDeleteClient from "./CategoryDeleteClient";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { site_id?: string; store_id?: string };
}) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const siteId = searchParams.site_id || "site_demo";
  const storeId = searchParams.store_id || "s_demo";

  await requireModule({ tenant_id, site_id: siteId, module: "catalog" });

  const categories = await listCategories(tenant_id);

  return (
    <div>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Categories</h1>

        <CategoryCreateClient siteId={siteId} />

        <div className="space-y-2">
          {categories.map((c: any) => (
            <div
              key={c.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm opacity-70">
                  slug: {c.slug}
                  {c.parent_id ? ` · parent_id: ${c.parent_id}` : ""}
                </div>
              </div>
              <CategoryDeleteClient siteId={siteId} categoryId={c.id} />
            </div>
          ))}
          {categories.length === 0 && (
            <div className="opacity-70">No categories yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
