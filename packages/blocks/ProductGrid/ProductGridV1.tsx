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
};

export default async function ProductGridV1({
  tenantId,
  storeId,
  title,
  limit = 8,
  contentWidth = "xl",
}: Props) {
  const products = await listPublishedProductsForStore({
    tenant_id: tenantId,
    store_id: storeId,
    limit,
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
    <section className="py-10 md:py-12 lg:py-16">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClass}`}>
        {title && (
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-8">
            {title}
          </h2>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No published products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:gap-8">
            {products.map((product) => (
              <ProductCardV1 product={product} key={product.id} />
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
