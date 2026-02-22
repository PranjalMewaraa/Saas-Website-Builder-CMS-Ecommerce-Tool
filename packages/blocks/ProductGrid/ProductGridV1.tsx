// components/ProductGridV1.tsx
import Link from "next/link";
import { listPublishedProductsForStore } from "./productGrid.data";
import { ImageOff } from "lucide-react";
import ProductCardV1 from "./ProductCardBlocks/ProductCardV1";

type Props = {
  tenantId: string;
  storeId: string;
  title?: string;
  limit?: number;
  contentWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  detailPathPrefix?: string;
  cardVariant?:
    | "default"
    | "minimal"
    | "compact"
    | "bordered"
    | "horizontal"
    | "editorial"
    | "elevated"
    | "glass"
    | "dark";
};

export default async function ProductGridV1({
  tenantId,
  storeId,
  title,
  limit = 8,
  contentWidth = "xl",
  detailPathPrefix = "/products",
  cardVariant = "default",
}: Props) {
  const products = await listPublishedProductsForStore({
    tenant_id: tenantId,
    store_id: storeId,
    limit,
  });

  console.log("[ProductGrid:render]", {
    tenantId,
    storeId,
    limit,
    renderedCount: products.length,
    productIds: products.map((p) => p.id),
  });

  const maxWidthClass =
    {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    }[contentWidth] || "max-w-7xl";

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClass}`}>
        {title && (
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Curated picks with clean visuals and quick details.
              </p>
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <ImageOff size={26} strokeWidth={1.5} className="text-slate-400" />
            </div>
            <div className="text-base font-medium text-slate-700">
              Products are coming soon
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Publish products to show them here.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:gap-8">
            {products.map((product) => (
              <ProductCardV1
                product={product}
                key={product.id}
                detailPathPrefix={detailPathPrefix}
                variant={cardVariant}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// Product Type (safe & flexible)
// ────────────────────────────────────────────────
