import { pagesCollection } from "@acme/db-mongo/pages.repo";

function newPageId() {
  return `page_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function ensureCommercePages(tenant_id: string, site_id: string) {
  const col = await pagesCollection();

  async function ensurePage(slug: string, title: string, layout: any) {
    const existing = await col.findOne({ tenant_id, site_id, slug });
    if (existing) return;
    await col.insertOne({
      _id: newPageId(),
      tenant_id,
      site_id,
      slug,
      title,
      draft_layout: layout,
      seo: { title, description: "" },
      created_at: new Date(),
      updated_at: new Date(),
    } as any);
  }

  const headerBlock = {
    id: `b_${Date.now()}_hdr`,
    type: "Header/V1",
    props: { menuId: "menu_main", ctaText: "Shop", ctaHref: "/products" },
    style: { overrides: {}, responsive: {} },
  };
  const footerBlock = {
    id: `b_${Date.now()}_ftr`,
    type: "Footer/V1",
    props: { menuId: "menu_footer" },
    style: {
      overrides: { bg: { type: "solid", color: "#0f172a" }, textColor: "#94a3b8" },
      responsive: {},
    },
  };

  await ensurePage("/products", "Products", {
    version: 1,
    sections: [
      {
        id: "sec_main",
        label: "Products",
        blocks: [
          headerBlock,
          {
            id: `b_${Date.now()}_plist`,
            type: "ProductList/V1",
            props: {
              title: "All Products",
              limit: 12,
              showFilters: true,
              showSearch: true,
              detailPathPrefix: "/products",
            },
            style: { overrides: {}, responsive: {} },
          },
          footerBlock,
        ],
      },
    ],
  });

  await ensurePage("/products/[slug]", "Product Detail", {
    version: 1,
    sections: [
      {
        id: "sec_main",
        label: "Product Detail",
        blocks: [
          headerBlock,
          {
            id: `b_${Date.now()}_pdet`,
            type: "ProductDetail/V1",
            props: {
              showRelated: true,
              relatedLimit: 4,
              detailPathPrefix: "/products",
            },
            style: { overrides: {}, responsive: {} },
          },
          footerBlock,
        ],
      },
    ],
  });

  await ensurePage("/cart", "Cart", {
    version: 1,
    sections: [
      {
        id: "sec_main",
        label: "Cart",
        blocks: [
          headerBlock,
          {
            id: `b_${Date.now()}_cart`,
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
          },
          footerBlock,
        ],
      },
    ],
  });
}
