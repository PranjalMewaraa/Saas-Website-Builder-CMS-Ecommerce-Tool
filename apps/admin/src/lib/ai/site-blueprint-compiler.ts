import type { AiSiteBlueprint } from "./blueprint-schema";

function normalizePaddingOrMargin(v: any) {
  if (!v || typeof v !== "object") return undefined;
  const out: any = {};
  for (const k of ["top", "right", "bottom", "left"]) {
    if (v[k] == null) continue;
    out[k] = v[k];
  }
  return Object.keys(out).length ? out : undefined;
}

function normalizeStyle(style: Record<string, any> | undefined) {
  if (!style) return undefined;
  const next: any = { ...style };
  if (style.padding) next.padding = normalizePaddingOrMargin(style.padding);
  if (style.margin) next.margin = normalizePaddingOrMargin(style.margin);
  if (!next.padding) delete next.padding;
  if (!next.margin) delete next.margin;
  return next;
}

function mergeStyles(...styles: Array<Record<string, any> | undefined>) {
  const merged = Object.assign({}, ...styles.filter(Boolean));
  return Object.keys(merged).length ? merged : undefined;
}

function isAtomicType(type: string) {
  return type.startsWith("Atomic/");
}

function compileRows(
  rows: AiSiteBlueprint["pages"][number]["sections"][number]["rows"],
) {
  return (rows || []).map((row) => ({
    id: row.id,
    style: normalizeStyle(row.style),
    layout: row.preset ? { mode: "preset", presetId: row.preset } : undefined,
    cols: (row.cols || []).map((col) => ({
      id: col.id,
      style: normalizeStyle(col.style),
      blocks: (col.blocks || []).map((b) => ({
        id: b.id,
        type: b.type,
        props: b.props || {},
        style: normalizeStyle(b.style as any),
      })),
    })),
  }));
}

function compileSection(
  section: AiSiteBlueprint["pages"][number]["sections"][number],
  rows?: AiSiteBlueprint["pages"][number]["sections"][number]["rows"],
  compiledId?: string,
) {
  return {
    id: compiledId || section.id,
    type: "Layout/Section",
    props: {
      style: normalizeStyle(section.style),
      rows: compileRows(rows || section.rows || []),
    },
  };
}

function shellHeaderBlock() {
  return {
    id: "ai_shell_header",
    type: "Header/V1",
    props: {
      menuId: "menu_main",
      ctaText: "Shop",
      ctaHref: "/products",
    },
    style: { overrides: {}, responsive: {} },
  };
}

function shellFooterBlock() {
  return {
    id: "ai_shell_footer",
    type: "Footer/V1",
    props: { menuId: "menu_footer" },
    style: {
      overrides: {
        bg: { type: "solid", color: "#0f172a" },
        textColor: "#94a3b8",
      },
      responsive: {},
    },
  };
}

function liftStandaloneBlockFromRow(
  row: AiSiteBlueprint["pages"][number]["sections"][number]["rows"][number],
) {
  if ((row.cols || []).length !== 1) return null;
  const col = row.cols?.[0];
  if (!col || (col.blocks || []).length !== 1) return null;
  const block = col.blocks?.[0];
  if (!block || isAtomicType(block.type) || block.type === "Layout/Section") {
    return null;
  }
  return {
    id: block.id,
    type: block.type,
    props: block.props || {},
    style: wrapBlockStyle(mergeStyles(row.style as any, col.style as any, block.style as any)),
  };
}

function slugPrimaryBlock(page: AiSiteBlueprint["pages"][number]) {
  const slug = page.slug;
  if (slug === "/products") {
    return {
      id: "ai_primary_products",
      type: "ProductList/V1",
      props: {
        title: page.title || "All Products",
        limit: 12,
        showFilters: true,
        showSearch: true,
        detailPathPrefix: "/products",
      },
      style: { overrides: {}, responsive: {} },
    };
  }
  if (slug === "/products/[slug]") {
    return {
      id: "ai_primary_product_detail",
      type: "ProductDetail/V1",
      props: {
        showRelated: true,
        relatedLimit: 4,
        detailPathPrefix: "/products",
      },
      style: { overrides: {}, responsive: {} },
    };
  }
  if (slug === "/cart") {
    return {
      id: "ai_primary_cart",
      type: "CartPage/V1",
      props: {
        title: "Your cart",
        emptyTitle: "Your cart is empty",
        emptyCtaText: "Browse products",
        emptyCtaHref: "/products",
        checkoutText: "Checkout",
        checkoutMode: "create-order",
        checkoutHref: "/checkout",
      },
      style: { overrides: {}, responsive: {} },
    };
  }
  return null;
}

export function compileBlueprintToPageLayout(page: AiSiteBlueprint["pages"][number]) {
  const primaryBlock = slugPrimaryBlock(page);
  const contentBlocks = (page.sections || []).flatMap((section, idx) => {
    const rows = section.rows || [];
    if (!rows.length) {
      return [
        compileSection(section, undefined, `ai_layout_${section.id}_${idx + 1}`),
      ];
    }
    return rows.map((row, rowIdx) => {
      const lifted = liftStandaloneBlockFromRow(row);
      if (lifted) return lifted;
      return compileSection(
        section,
        [row],
        `ai_layout_${section.id}_${idx + 1}_${rowIdx + 1}`,
      );
    });
  });

  return {
    version: 1,
    sections: [
      {
        id: "ai_main",
        label: "AI Generated Page",
        blocks: [
          shellHeaderBlock(),
          ...(primaryBlock ? [primaryBlock] : []),
          ...contentBlocks,
          shellFooterBlock(),
        ],
      },
    ],
  };
}
