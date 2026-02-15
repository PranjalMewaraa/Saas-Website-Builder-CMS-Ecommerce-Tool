import { ImageOff } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  base_price_cents: number;
  compare_at_price_cents?: number | null;
  brand_id?: number | null;
  images: Array<{
    url: string;
    alt?: string;
    sort_order?: number;
  }>;
  attributes?: Array<{
    code: string;
    name: string;
    type: "text" | "number" | "date" | "boolean" | "select";
    value: string | number | boolean;
  }>;
  variants?: any[];
  categories?: any[];
}

// ────────────────────────────────────────────────
// Product Card Component
// ────────────────────────────────────────────────
function fixDoubleProtocolUrl(url: any) {
  if (typeof url !== "string" || !url) {
    return url; // return as-is if not a string or empty
  }

  // Remove duplicate protocol patterns (most common cases)
  let corrected = url
    .replace(/^https?:\/\/https?:\/\//i, "https://") // https://https://  or http://https://
    .replace(/^http:\/\/http:\/\//i, "http://") // http://http://
    .replace(/^(https?:\/\/)+/, "https://"); // any number of repeated https:// or http:// → keep one https

  // Also fix cases like https:/https:// or https:////
  corrected = corrected.replace(/^(https?:\/)\/+(?!\/)/, "https://");

  return corrected;
}
function joinPath(base: string, slug: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const s = slug.startsWith("/") ? slug.slice(1) : slug;
  if (!b || b === "/") return `/${s}`;
  return `${b}/${s}`;
}

function ProductCardV1({
  product,
  detailPathPrefix = "/products",
  clickable = true,
}: {
  product: Product;
  detailPathPrefix?: string;
  clickable?: boolean;
}) {
  const primaryImage = product.images?.[0];
  const primaryImageUrl = fixDoubleProtocolUrl(product.images?.[0]?.url);
  const price = product.base_price_cents / 100;
  const comparePrice = product.compare_at_price_cents
    ? product.compare_at_price_cents / 100
    : null;

  const description = product.description?.trim()
    ? product.description
    : "High-quality product with great features and reliable performance.";

  const CardWrapper: any = clickable ? Link : "div";
  const wrapperProps: any = clickable
    ? {
        href: joinPath(detailPathPrefix || "/products", product.slug),
      }
    : {};

  return (
    <CardWrapper
      {...wrapperProps}
      className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2"
    >
      {/* Image */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-100">
        {primaryImage ? (
          <img
            src={primaryImageUrl}
            alt={primaryImage.alt || product.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <ImageOff size={46} strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-wide">
              Image coming soon
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 transition-colors group-hover:text-slate-700">
          {product.title}
        </h3>

        {/* Description (shortened) */}
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">
          {description}
        </p>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-xl font-semibold text-slate-900">
            ${price.toFixed(2)}
          </span>

          {comparePrice && comparePrice > price && (
            <span className="text-sm text-slate-500 line-through">
              ${comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Optional attributes preview (first 2) */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            {product.attributes.slice(0, 2).map((attr) => (
              <div key={attr.code} className="flex items-center gap-1">
                <span className="font-medium text-slate-700">{attr.name}:</span>
                <span>
                  {attr.type === "boolean"
                    ? attr.value
                      ? "Yes"
                      : "No"
                    : attr.value}
                </span>
              </div>
            ))}
            {product.attributes.length > 2 && (
              <span className="text-slate-400">
                +{product.attributes.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
export default ProductCardV1;
