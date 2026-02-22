import { ImageOff } from "lucide-react";
import Link from "next/link";
import { normalizeImageUrl } from "../../commerce/image-utils";

// ────────────────────────────────────────────────
// Product Card Component
// ────────────────────────────────────────────────
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
  variant = "default",
}: {
  product: any;
  detailPathPrefix?: string;
  clickable?: boolean;
  variant?:
    | "default"
    | "minimal"
    | "compact"
    | "bordered"
    | "horizontal"
    | "editorial"
    | "elevated"
    | "glass"
    | "dark";
}) {
  const primaryImage = product.images?.[0];
  const primaryImageUrl = normalizeImageUrl(product.images?.[0]?.url);
  const variantPriceCandidates = (product.variants || [])
    .map((v: any) => Number(v?.price_cents || 0))
    .filter((n: number) => Number.isFinite(n) && n > 0);
  const variantCompareCandidates = (product.variants || [])
    .map((v: any) => Number(v?.compare_at_price_cents || 0))
    .filter((n: number) => Number.isFinite(n) && n > 0);

  const displayPriceCents = variantPriceCandidates.length
    ? Math.min(...variantPriceCandidates)
    : Number(product.base_price_cents || 0);
  const displayCompareCents = variantCompareCandidates.length
    ? Math.min(...variantCompareCandidates)
    : Number(product.compare_at_price_cents || 0);

  const price = displayPriceCents / 100;
  const comparePrice = displayCompareCents > 0 ? displayCompareCents / 100 : null;

  const description = product.description?.trim()
    ? product.description
    : "High-quality product with great features and reliable performance.";

  const CardWrapper: any = clickable ? Link : "div";
  const wrapperProps: any = clickable
    ? {
        href: joinPath(detailPathPrefix || "/products", product.slug),
      }
    : {};

  const attributePreview =
    product.attributes && product.attributes.length > 0 ? (
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        {product.attributes.slice(0, 2).map((attr: any) => (
          <div key={attr.code} className="flex items-center gap-1">
            <span className="font-medium text-slate-700">{attr.name}:</span>
            <span>
              {attr.type === "boolean" ? (attr.value ? "Yes" : "No") : attr.value}
            </span>
          </div>
        ))}
        {product.attributes.length > 2 && (
          <span className="text-slate-400">+{product.attributes.length - 2} more</span>
        )}
      </div>
    ) : null;

  const discountPercent =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  const variantInventory = (product.variants || [])
    .map((v: any) => Number(v?.inventory_qty ?? 0))
    .filter((n: number) => Number.isFinite(n));
  const totalInventory = variantInventory.length
    ? variantInventory.reduce((sum: number, n: number) => sum + n, 0)
    : Number(product.inventory_qty ?? product.inventory_quantity ?? 0);
  const stockState =
    totalInventory <= 0 ? "out" : totalInventory <= 5 ? "low" : null;
  const stockBadge = stockState ? (
    <span
      className="absolute left-3 top-3 z-20 m-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
      style={{
        backgroundColor: stockState === "out" ? "#dc2626" : "#f97316",
      }}
    >
      {stockState === "out" ? "Out of stock" : `Low stock (${Math.max(0, totalInventory)})`}
    </span>
  ) : null;

  if (variant === "minimal") {
    return (
      <CardWrapper
        {...wrapperProps}
        className="group block overflow-hidden rounded-xl border border-slate-100 bg-white p-3 transition-all hover:border-slate-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2"
      >
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
          {stockBadge}
          {primaryImage ? (
            <img
              src={primaryImageUrl}
              alt={primaryImage.alt || product.title}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff size={34} strokeWidth={1.5} />
            </div>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{product.title}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold text-slate-900">₹{price.toFixed(2)}</span>
          {comparePrice && comparePrice > price ? (
            <span className="text-xs text-slate-400 line-through">₹{comparePrice.toFixed(2)}</span>
          ) : null}
        </div>
      </CardWrapper>
    );
  }

  if (variant === "compact") {
    return (
      <CardWrapper
        {...wrapperProps}
        className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2"
      >
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          {stockBadge}
          {primaryImage ? (
            <img
              src={primaryImageUrl}
              alt={primaryImage.alt || product.title}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff size={36} strokeWidth={1.5} />
            </div>
          )}
          {discountPercent > 0 ? (
            <span className="absolute right-2 top-2 rounded-full bg-slate-900 px-2 py-1 text-[11px] font-medium text-white">
              {discountPercent}% off
            </span>
          ) : null}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{product.title}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-slate-600">{description}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-semibold text-slate-900">₹{price.toFixed(2)}</span>
            {comparePrice && comparePrice > price ? (
              <span className="text-xs text-slate-500 line-through">₹{comparePrice.toFixed(2)}</span>
            ) : null}
          </div>
        </div>
      </CardWrapper>
    );
  }

  if (variant === "bordered") {
    return (
      <CardWrapper
        {...wrapperProps}
        className="group block overflow-hidden rounded-2xl border-2 border-slate-900 bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2"
      >
        <div className="relative h-56 w-full overflow-hidden bg-slate-100">
          {stockBadge}
          {primaryImage ? (
            <img
              src={primaryImageUrl}
              alt={primaryImage.alt || product.title}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff size={40} strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{product.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{description}</p>
          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="text-xl font-semibold text-slate-900">₹{price.toFixed(2)}</span>
            {comparePrice && comparePrice > price ? (
              <span className="text-sm text-slate-500 line-through">₹{comparePrice.toFixed(2)}</span>
            ) : null}
          </div>
          {attributePreview}
        </div>
      </CardWrapper>
    );
  }

  if (variant === "horizontal") {
    return (
      <CardWrapper
        {...wrapperProps}
        className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2"
      >
        <div className="flex min-h-[180px]">
          <div className="relative w-40 shrink-0 overflow-hidden bg-slate-100 sm:w-48">
            {stockBadge}
            {primaryImage ? (
              <img
                src={primaryImageUrl}
                alt={primaryImage.alt || product.title}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                <ImageOff size={36} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{product.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{description}</p>
            </div>
            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-xl font-semibold text-slate-900">₹{price.toFixed(2)}</span>
              {comparePrice && comparePrice > price ? (
                <span className="text-sm text-slate-500 line-through">₹{comparePrice.toFixed(2)}</span>
              ) : null}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  if (variant === "editorial") {
    return (
      <CardWrapper
        {...wrapperProps}
        className="group block overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2"
      >
        <div className="relative h-72 w-full overflow-hidden bg-slate-100">
          {stockBadge}
          {primaryImage ? (
            <img
              src={primaryImageUrl}
              alt={primaryImage.alt || product.title}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff size={44} strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="p-6">
          <h3 className="line-clamp-2 text-xl font-semibold text-slate-900">{product.title}</h3>
          <p className="mt-3 line-clamp-2 text-sm text-slate-600">{description}</p>
          <div className="mt-5 flex items-baseline gap-2.5">
            <span className="text-2xl font-semibold text-slate-900">₹{price.toFixed(2)}</span>
            {comparePrice && comparePrice > price ? (
              <span className="text-sm text-slate-500 line-through">₹{comparePrice.toFixed(2)}</span>
            ) : null}
          </div>
        </div>
      </CardWrapper>
    );
  }

  if (variant === "elevated") {
    return (
      <CardWrapper
        {...wrapperProps}
        className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2"
      >
        <div className="relative h-64 w-full overflow-hidden bg-slate-100">
          {stockBadge}
          {primaryImage ? (
            <img
              src={primaryImageUrl}
              alt={primaryImage.alt || product.title}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff size={42} strokeWidth={1.5} />
            </div>
          )}
          {discountPercent > 0 ? (
            <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
              Save {discountPercent}%
            </span>
          ) : null}
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{product.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-slate-900">₹{price.toFixed(2)}</span>
              {comparePrice && comparePrice > price ? (
                <span className="text-sm text-slate-500 line-through">₹{comparePrice.toFixed(2)}</span>
              ) : null}
            </div>
            <span className="text-xs font-medium text-slate-500">View details</span>
          </div>
        </div>
      </CardWrapper>
    );
  }

  if (variant === "glass") {
    return (
      <CardWrapper
        {...wrapperProps}
        className="group relative block overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-b from-white/90 to-slate-100/80 p-3 shadow-md backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2"
      >
        <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-slate-100">
          {stockBadge}
          {primaryImage ? (
            <img
              src={primaryImageUrl}
              alt={primaryImage.alt || product.title}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff size={40} strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{product.title}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-slate-900">₹{price.toFixed(2)}</span>
            {comparePrice && comparePrice > price ? (
              <span className="text-xs text-slate-500 line-through">₹{comparePrice.toFixed(2)}</span>
            ) : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{description}</p>
        </div>
      </CardWrapper>
    );
  }

  if (variant === "dark") {
    return (
      <CardWrapper
        {...wrapperProps}
        className="group block overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 transition-all hover:-translate-y-0.5 hover:border-slate-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500/70 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <div className="relative h-60 w-full overflow-hidden bg-slate-800">
          {stockBadge}
          {primaryImage ? (
            <img
              src={primaryImageUrl}
              alt={primaryImage.alt || product.title}
              className="h-full w-full object-cover object-center opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
              <ImageOff size={40} strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 text-lg font-semibold text-white">{product.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-300">{description}</p>
          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="text-xl font-semibold text-white">₹{price.toFixed(2)}</span>
            {comparePrice && comparePrice > price ? (
              <span className="text-sm text-slate-400 line-through">₹{comparePrice.toFixed(2)}</span>
            ) : null}
          </div>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      {...wrapperProps}
      className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2"
    >
      {/* Image */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-100">
        {stockBadge}
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
            ₹{price.toFixed(2)}
          </span>

          {comparePrice && comparePrice > price && (
            <span className="text-sm text-slate-500 line-through">
              ₹{comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Optional attributes preview (first 2) */}
        {attributePreview}
      </div>
    </CardWrapper>
  );
}
export default ProductCardV1;
