import ProductCardV1 from "../ProductGrid/ProductCardBlocks/ProductCardV1";
import { getPublishedProductBySlug, listRelatedProducts } from "./productDetail.data";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  tenantId: string;
  storeId: string;
  contentWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showRelated?: boolean;
  relatedLimit?: number;
  detailPathPrefix?: string;
  relatedCardVariant?:
    | "default"
    | "minimal"
    | "compact"
    | "bordered"
    | "horizontal"
    | "editorial"
    | "elevated"
    | "glass"
    | "dark";
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
  relatedCardVariant = "default",
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
        <ProductDetailClient product={product} basePath={basePath || "/products"} />

        {showRelated && related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900">
              Related products
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCardV1
                  key={p.id}
                  product={p as any}
                  detailPathPrefix={basePath || "/products"}
                  variant={relatedCardVariant}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
