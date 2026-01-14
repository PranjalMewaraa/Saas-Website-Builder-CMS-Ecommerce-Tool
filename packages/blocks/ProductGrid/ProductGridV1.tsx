import Link from "next/link";
import { listPublishedProductsForStore } from "./productGrid.data";

type Props = {
  tenantId: string;
  storeId: string;
  title?: string;
  limit: number;
};

export default async function ProductGridV1({
  tenantId,
  storeId,
  title,
  limit,
}: Props) {
  const products = await listPublishedProductsForStore({
    tenant_id: tenantId,
    store_id: storeId,
    limit,
  });

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="border rounded p-3 hover:shadow-sm transition"
            >
              <div className="font-medium text-sm">{p.title}</div>
              <div className="text-sm opacity-75 mt-1">
                ${(p.base_price_cents / 100).toFixed(2)}
              </div>
            </Link>
          ))}

          {products.length === 0 ? (
            <div className="col-span-2 md:col-span-4 opacity-70 text-sm">
              No published products yet for this store.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
