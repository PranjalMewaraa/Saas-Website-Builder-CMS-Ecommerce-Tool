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
function ProductCardV1({ product }: { product: Product }) {
  const primaryImage = product.images?.[0];
  const primaryImageUrl = fixDoubleProtocolUrl(product.images?.[0]?.url);
  console.log(primaryImageUrl);
  const price = product.base_price_cents / 100;
  const comparePrice = product.compare_at_price_cents
    ? product.compare_at_price_cents / 100
    : null;

  const description = product.description?.trim()
    ? product.description
    : "High-quality product with great features and reliable performance.";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {/* Image */}
      <div className="aspect-[4/5] w-full bg-gray-100 relative overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImageUrl}
            alt={primaryImage.alt || product.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <ImageOff size={48} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>

        {/* Description (shortened) */}
        <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">
          {description}
        </p>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2.5">
          <span className="text-xl font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>

          {comparePrice && comparePrice > price && (
            <span className="text-sm text-gray-500 line-through">
              ${comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Optional attributes preview (first 2) */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-3">
            {product.attributes.slice(0, 2).map((attr) => (
              <div key={attr.code} className="flex items-center gap-1">
                <span className="font-medium text-gray-700">{attr.name}:</span>
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
              <span className="text-gray-400">
                +{product.attributes.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
export default ProductCardV1;
