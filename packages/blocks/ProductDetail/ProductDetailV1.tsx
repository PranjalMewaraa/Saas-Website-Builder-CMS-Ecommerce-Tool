import Link from "next/link";
import ProductCardV1 from "../ProductGrid/ProductCardBlocks/ProductCardV1";
import AddToCartV1 from "../cart/AddToCartV1";
import { getPublishedProductBySlug, listRelatedProducts } from "./productDetail.data";

type Props = {
  tenantId: string;
  storeId: string;
  contentWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showRelated?: boolean;
  relatedLimit?: number;
  detailPathPrefix?: string;
  path?: string;
  search?: string;
};

function clampBasePath(base?: string) {
  const raw = (base || "/products").trim() || "/products";
  if (raw === "/") return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function slugFromPath(path: string, basePath: string) {
  const base = basePath || "/products";
  if (!path.startsWith(base)) return "";
  const rest = path.slice(base.length).replace(/^\/+/, "");
  return rest || "";
}

export default async function ProductDetailV1({
  tenantId,
  storeId,
  contentWidth = "xl",
  showRelated = true,
  relatedLimit = 4,
  detailPathPrefix = "/products",
  path: propPath,
}: Props) {
  const basePath = clampBasePath(detailPathPrefix);
  const path = propPath || "/";
  const slug = slugFromPath(path, basePath || "/products");

  if (!slug) {
    return (
      <section className="py-12">
        <div className="mx-auto px-4 max-w-3xl">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <div className="text-base font-medium text-slate-700">
              Product detail page is missing a slug
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Use a URL like {basePath || "/products"}/your-product-slug
            </div>
          </div>
        </div>
      </section>
    );
  }

  const product = await getPublishedProductBySlug({
    tenant_id: tenantId,
    store_id: storeId,
    slug,
  });

  if (!product) {
    return (
      <section className="py-12">
        <div className="mx-auto px-4 max-w-3xl">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <div className="text-base font-medium text-slate-700">
              Product not found
            </div>
            <div className="mt-1 text-sm text-slate-500">
              This product may be unpublished or archived.
            </div>
          </div>
        </div>
      </section>
    );
  }

  const maxWidthClass =
    {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    }[contentWidth] || "max-w-7xl";

  const primaryImage = product.images?.[0];
  const price = product.base_price_cents / 100;
  const comparePrice = product.compare_at_price_cents
    ? product.compare_at_price_cents / 100
    : null;
  const inventoryQty = (product.variants || []).reduce(
    (sum: number, v: any) => sum + Number(v.inventory_qty || 0),
    0,
  );
  const stockLabel =
    inventoryQty <= 0
      ? "Out of Stock"
      : inventoryQty <= 5
        ? "Low Stock"
        : "In Stock";

  const related = showRelated
    ? await listRelatedProducts({
        tenant_id: tenantId,
        store_id: storeId,
        product,
        limit: relatedLimit,
      })
    : [];

  return (
    <section className="py-12 md:py-16">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClass}`}>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.alt || product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] flex items-center justify-center text-slate-400">
                No image
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-sm text-slate-500">
              <Link href={basePath || "/products"} className="hover:underline">
                Products
              </Link>
              <span className="mx-2">/</span>
              <span>{product.title}</span>
            </div>

            <h1 className="text-3xl font-semibold text-slate-900">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-slate-900">
                ${price.toFixed(2)}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-sm text-slate-500 line-through">
                  ${comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-sm text-slate-600">{stockLabel}</div>

            {product.description && (
              <p className="text-slate-600 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="mt-4">
              <AddToCartV1
                productId={product.id}
                title={product.title}
                priceCents={product.base_price_cents}
                image={primaryImage?.url}
                buttonText="Add to cart"
                inventoryQty={inventoryQty}
              />
            </div>

            {product.attributes?.length ? (
              <div className="pt-4 border-t border-slate-200">
                <div className="text-sm font-medium text-slate-700 mb-2">
                  Details
                </div>
                <div className="grid gap-2 text-sm text-slate-600">
                  {product.attributes.map((attr) => (
                    <div key={attr.code} className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">
                        {attr.name}:
                      </span>
                      <span>{String(attr.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {showRelated && related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900">
              Related products
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCardV1
                  key={p.id}
                  product={p}
                  detailPathPrefix={basePath || "/products"}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
