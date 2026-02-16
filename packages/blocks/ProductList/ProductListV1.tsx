import Link from "next/link";
import ProductCardV1 from "../ProductGrid/ProductCardBlocks/ProductCardV1";
import CategoryFilterTreeClient from "./CategoryFilterTreeClient";
import {
  getStoreFilterMeta,
  listPublishedProductsForStoreWithFilters,
  countPublishedProductsForStoreWithFilters,
} from "./productList.data";

type Props = {
  tenantId: string;
  storeId: string;
  title?: string;
  limit?: number;
  contentWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showFilters?: boolean;
  showSearch?: boolean;
  detailPathPrefix?: string;
  path?: string;
  search?: string;
};

function readSearchParams(search?: string): URLSearchParams {
  const raw = (search || "").trim();
  if (!raw) return new URLSearchParams();
  if (raw.startsWith("?")) return new URLSearchParams(raw.slice(1));
  if (raw.includes("?")) {
    const url = new URL(raw, "http://localhost");
    return url.searchParams;
  }
  return new URLSearchParams(raw);
}

function pickMulti(sp: URLSearchParams, key: string) {
  const all = sp.getAll(key);
  const flat = all
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .map((v) => v.replace(/\\+$/g, ""))
    .filter(Boolean);
  return Array.from(new Set(flat));
}

function stripParams(sp: URLSearchParams, keys: string[]): URLSearchParams {
  const next = new URLSearchParams(sp.toString());
  for (const k of keys) next.delete(k);
  return next;
}

function parseAttrFilters(values: string[]) {
  const map = new Map<string, Set<string>>();
  for (const v of values) {
    const [code, value] = v.split("::");
    if (!code || value == null) continue;
    if (!map.has(code)) map.set(code, new Set());
    map.get(code)!.add(value);
  }
  return Array.from(map.entries()).map(([code, set]) => ({
    code,
    values: Array.from(set),
  }));
}

function buildCategoryTree(
  categories: Array<{ id: string; name: string; parent_id?: string | null }>,
) {
  const byParent: Record<string, typeof categories> = {};
  const roots: typeof categories = [];
  const byId: Record<string, { id: string; name: string; parent_id?: string | null }> = {};
  for (const c of categories) {
    byId[c.id] = c;
    const parent = c.parent_id || "";
    if (!parent) roots.push(c);
    if (!byParent[parent]) byParent[parent] = [];
    byParent[parent].push(c);
  }
  // If filtered results only contain subcategories, parent may be missing.
  // Treat those orphan children as roots so category filter doesn't render empty.
  for (const c of categories) {
    const parent = c.parent_id || "";
    if (!parent) continue;
    if (!byId[parent]) roots.push(c);
  }
  for (const key of Object.keys(byParent)) {
    byParent[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  const out: Array<{ id: string; label: string; parent_id?: string | null }> = [];
  function walk(nodes: typeof categories, depth: number) {
    for (const node of nodes) {
      out.push({
        id: node.id,
        label: `${"— ".repeat(depth)}${node.name}`,
        parent_id: node.parent_id || null,
      });
      const children = byParent[node.id] || [];
      if (children.length) walk(children, depth + 1);
    }
  }
  walk(roots, 0);
  return out;
}

function buildChildrenMap(
  categories: Array<{ id: string; name: string; parent_id?: string | null }>,
) {
  const map = new Map<string, string[]>();
  for (const c of categories) {
    const parent = c.parent_id || "";
    if (!parent) continue;
    const list = map.get(parent) || [];
    list.push(c.id);
    map.set(parent, list);
  }
  return map;
}

function collectDescendants(childrenMap: Map<string, string[]>, startId: string) {
  const out: string[] = [];
  const queue = [...(childrenMap.get(startId) || [])];
  const seen = new Set<string>();
  while (queue.length) {
    const id = String(queue.shift() || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    const kids = childrenMap.get(id) || [];
    for (const k of kids) {
      if (!seen.has(k)) queue.push(k);
    }
  }
  return out;
}

function clampBasePath(base?: string) {
  const raw = (base || "/products").trim() || "/products";
  if (raw === "/") return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function withParams(base: string, params: URLSearchParams) {
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function ProductSearchBar({
  defaultValue,
  basePath,
  params,
}: {
  defaultValue: string;
  basePath: string;
  params: URLSearchParams;
}) {
  const keep = Array.from(params.entries()).filter(
    ([k]) => k !== "q" && k !== "page",
  );
  return (
    <form
      method="get"
      action={basePath}
      className="w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
    >
      {keep.map(([k, v], idx) => (
        <input key={`${k}-${v}-${idx}`} type="hidden" name={k} value={v} />
      ))}
      <div className="flex items-center gap-2">
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Search products by title, SKU, category, brand, or attributes..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">
          Search
        </button>
      </div>
    </form>
  );
}

export default async function ProductListV1({
  tenantId,
  storeId,
  title = "Products",
  limit = 12,
  contentWidth = "xl",
  showFilters = true,
  showSearch = true,
  detailPathPrefix = "/products",
  search,
}: Props) {
  const sp = readSearchParams(search);

  const q = (sp.get("q") || "").trim();
  const brandIds = pickMulti(sp, "brand");
  const categoryIds = pickMulti(sp, "category");
  const attrValues = pickMulti(sp, "attr");
  const attrFilters = parseAttrFilters(attrValues);
  const sort = (sp.get("sort") || "newest") as
    | "newest"
    | "price_asc"
    | "price_desc"
    | "title_asc";
  const minPrice = sp.get("min") ? Number(sp.get("min")) : undefined;
  const maxPrice = sp.get("max") ? Number(sp.get("max")) : undefined;
  const page = Math.max(1, Number(sp.get("page") || 1));
  const perPage = Math.max(1, Number(sp.get("limit") || limit));
  const offset = (page - 1) * perPage;

  const filterMeta = await getStoreFilterMeta({
    tenant_id: tenantId,
    store_id: storeId,
  });

  const products = await listPublishedProductsForStoreWithFilters({
    tenant_id: tenantId,
    store_id: storeId,
    limit: perPage,
    offset,
    q: q || undefined,
    brand_ids: brandIds.length ? brandIds : undefined,
    category_ids: categoryIds.length ? categoryIds : undefined,
    attr_filters: attrFilters.length ? attrFilters : undefined,
    sort,
    min_price_cents:
      typeof minPrice === "number" && !Number.isNaN(minPrice)
        ? Math.round(minPrice * 100)
        : undefined,
    max_price_cents:
      typeof maxPrice === "number" && !Number.isNaN(maxPrice)
        ? Math.round(maxPrice * 100)
        : undefined,
  });

  const totalCount = await countPublishedProductsForStoreWithFilters({
    tenant_id: tenantId,
    store_id: storeId,
    q: q || undefined,
    brand_ids: brandIds.length ? brandIds : undefined,
    category_ids: categoryIds.length ? categoryIds : undefined,
    attr_filters: attrFilters.length ? attrFilters : undefined,
    sort,
    min_price_cents:
      typeof minPrice === "number" && !Number.isNaN(minPrice)
        ? Math.round(minPrice * 100)
        : undefined,
    max_price_cents:
      typeof maxPrice === "number" && !Number.isNaN(maxPrice)
        ? Math.round(maxPrice * 100)
        : undefined,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  const maxWidthClass =
    {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    }[contentWidth] || "max-w-7xl";

  const showBrandFilter =
    showFilters &&
    filterMeta.brands.length > 1 &&
    filterMeta.store_type !== "brand";

  const showCategoryFilter = showFilters && filterMeta.categories.length > 0;

  const showPriceFilter =
    showFilters && filterMeta.priceMax > filterMeta.priceMin;

  const basePath = clampBasePath(detailPathPrefix);
  const categoryOptions = buildCategoryTree(filterMeta.categories);
  const childrenMap = buildChildrenMap(filterMeta.categories);
  const checkedCategoryIds = new Set<string>(categoryIds);
  for (const selectedId of categoryIds) {
    const descendants = collectDescendants(childrenMap, selectedId);
    for (const childId of descendants) checkedCategoryIds.add(childId);
  }
  const baseListPath = basePath || "/products";
  const showAttributeFilters =
    showFilters && (filterMeta.attributes || []).length > 0;
  const hasFilterSidebar =
    showBrandFilter ||
    showCategoryFilter ||
    showPriceFilter ||
    showSearch ||
    showAttributeFilters;

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Browse products with clean filters and fast results.
            </p>
          </div>
        </div>

        {showSearch ? (
          <div className="mb-6">
            <ProductSearchBar defaultValue={q} basePath={baseListPath} params={sp} />
          </div>
        ) : null}

        <div
          className={
            hasFilterSidebar
              ? "flex flex-col md:flex-row gap-6 md:gap-8 items-start overflow-x-hidden"
              : "block"
          }
        >
          {hasFilterSidebar ? (
            <aside className="min-w-0 w-full md:w-64 md:flex-none md:sticky md:top-6 md:self-start">
              <form
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 overflow-hidden"
                method="get"
              >
                <div className="text-sm font-semibold text-slate-900">
                  Filters
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Sort
                  </span>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="title_asc">Title A-Z</option>
                  </select>
                </label>

                {showBrandFilter && (
                  <div className="block">
                    <div className="text-xs font-medium text-slate-600 mb-1">
                      Brands
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 p-2 space-y-1">
                      {filterMeta.brands.map((b) => (
                        <label
                          key={b.id}
                          className="flex items-center gap-2 text-sm min-w-0"
                        >
                          <input
                            type="checkbox"
                            name="brand"
                            value={b.id}
                            defaultChecked={brandIds.includes(b.id)}
                          />
                          <span className="truncate">{b.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {showCategoryFilter && (
                  <div className="block">
                    <div className="text-xs font-medium text-slate-600 mb-1">
                      Categories
                    </div>
                    <CategoryFilterTreeClient
                      options={categoryOptions}
                      initialSelectedIds={Array.from(checkedCategoryIds)}
                    />
                  </div>
                )}

                {showPriceFilter && (
                  <label className="block">
                    <span className="text-xs font-medium text-slate-600">
                      Price Range
                    </span>
                    <div className="mt-1 flex flex-col justify-center gap-2">
                      <input
                        name="min"
                        type="number"
                        step="0.01"
                        defaultValue={minPrice ?? ""}
                        placeholder={`${(filterMeta.priceMin / 100).toFixed(2)}`}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                      <span className="text-xs text-slate-500">to</span>
                      <input
                        name="max"
                        type="number"
                        step="0.01"
                        defaultValue={maxPrice ?? ""}
                        placeholder={`${(filterMeta.priceMax / 100).toFixed(2)}`}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  </label>
                )}

                {showAttributeFilters && (
                  <div className="block">
                    <div className="text-xs font-medium text-slate-600 mb-1">
                      Attributes
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto rounded-lg border border-slate-200 p-2">
                      {filterMeta.attributes.map((attr) => (
                        <div key={attr.code} className="space-y-1">
                          <div className="text-xs font-semibold text-slate-700">
                            {attr.name}
                          </div>
                          <div className="space-y-1">
                            {attr.values.map((v) => (
                              <label
                                key={`${attr.code}-${v}`}
                                className="flex items-start gap-2 text-sm min-w-0"
                              >
                                <input
                                  type="checkbox"
                                  name="attr"
                                  value={`${attr.code}::${v}`}
                                  defaultChecked={attrValues.includes(
                                    `${attr.code}::${v}`,
                                  )}
                                />
                                <span className="break-words">{v}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2 pt-1">
                  <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm">
                    Apply
                  </button>
                  <Link
                    href={baseListPath}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                  >
                    Reset
                  </Link>
                </div>
              </form>
            </aside>
          ) : null}

          <div
            className={
              hasFilterSidebar
                ? "min-w-0 w-full md:flex-1 overflow-hidden"
                : "min-w-0 overflow-hidden"
            }
          >
            {(q ||
              brandIds.length ||
              categoryIds.length ||
              attrValues.length ||
              minPrice ||
              maxPrice) && (
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-600 overflow-hidden">
                <span className="text-slate-500">Filters:</span>
                {q ? (
                  <Link
                    href={withParams(
                      baseListPath,
                      stripParams(sp, ["q", "page"]),
                    )}
                    className="px-2 py-1 rounded-full border max-w-full truncate"
                  >
                    Search: {q} ×
                  </Link>
                ) : null}
                {brandIds.length ? (
                  <Link
                    href={withParams(
                      baseListPath,
                      stripParams(sp, ["brand", "page"]),
                    )}
                    className="px-2 py-1 rounded-full border max-w-full truncate"
                  >
                    Brand ×
                  </Link>
                ) : null}
                {categoryIds.length ? (
                  <Link
                    href={withParams(
                      baseListPath,
                      stripParams(sp, ["category", "page"]),
                    )}
                    className="px-2 py-1 rounded-full border max-w-full truncate"
                  >
                    Category ×
                  </Link>
                ) : null}
                {attrValues.length ? (
                  <Link
                    href={withParams(
                      baseListPath,
                      stripParams(sp, ["attr", "page"]),
                    )}
                    className="px-2 py-1 rounded-full border max-w-full truncate"
                  >
                    Attributes ×
                  </Link>
                ) : null}
                {minPrice || maxPrice ? (
                  <Link
                    href={withParams(
                      baseListPath,
                      stripParams(sp, ["min", "max", "page"]),
                    )}
                    className="px-2 py-1 rounded-full border max-w-full truncate"
                  >
                    Price ×
                  </Link>
                ) : null}
                <Link
                  href={baseListPath}
                  className="px-2 py-1 rounded-full border bg-slate-50"
                >
                  Clear all
                </Link>
              </div>
            )}

            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <div className="text-base font-medium text-slate-700">
                  No products match your filters
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Try clearing filters or adjust your search.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 xl:gap-8">
                {products.map((product) => (
                  <ProductCardV1
                    key={product.id}
                    product={product}
                    detailPathPrefix={basePath || "/products"}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3 text-sm">
                <Link
                  href={withParams(
                    baseListPath,
                    new URLSearchParams({
                      ...Object.fromEntries(sp.entries()),
                      page: String(Math.max(1, page - 1)),
                      limit: String(perPage),
                    }),
                  )}
                  className={`px-3 py-1.5 rounded border ${
                    page <= 1 ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  Prev
                </Link>
                <span className="text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <Link
                  href={withParams(
                    baseListPath,
                    new URLSearchParams({
                      ...Object.fromEntries(sp.entries()),
                      page: String(Math.min(totalPages, page + 1)),
                      limit: String(perPage),
                    }),
                  )}
                  className={`px-3 py-1.5 rounded border ${
                    page >= totalPages ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  Next
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
