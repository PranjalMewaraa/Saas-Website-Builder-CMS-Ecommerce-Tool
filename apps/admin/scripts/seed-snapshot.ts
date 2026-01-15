import { getMongoDb } from "@acme/db-mongo";

type SnapshotDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  version: number;
  created_by: string;
  created_at: Date;
  theme?: any;
  stylePresets?: any;
  menus?: any;
  pages?: any;
  templates?: any;
};

type SiteDoc = {
  _id: string;
  tenant_id: string;
  store_id: string;
  published_snapshot_id?: string | null;
  updated_at?: Date;
};

async function run() {
  const db = await getMongoDb();

  const tenant_id = "t_demo";
  const site_id = "site_demo";
  const store_id = "s_demo";
  const snapshot_id = "snap_demo_phase4_1";

  const snapshot: SnapshotDoc = {
    _id: snapshot_id,
    tenant_id,
    site_id,
    version: 3,
    created_by: "u_demo_owner",
    created_at: new Date(),
    theme: {
      tokens: {
        "--color-primary": "#2563EB",
        "--color-bg": "#ffffff",
        "--color-text": "#111827",
        "--color-dark": "#0B1220",
        "--color-light": "#ffffff",
        "--radius-base": "16px",
      },
    },
    stylePresets: {
      preset_header_light: {
        name: "Header Light",
        style: {
          container: "full",
          padding: { top: 10, right: 0, bottom: 10, left: 0 },
          bg: { type: "solid", color: "var(--color-bg)" },
          border: { enabled: true, color: "rgba(0,0,0,0.08)", width: 1 },
          radius: 0,
          shadow: "none",
          align: { text: "left", items: "center", justify: "between" },
        },
      },
      preset_hero_gradient: {
        name: "Hero Gradient",
        style: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 72, right: 16, bottom: 72, left: 16 },
          bg: {
            type: "gradient",
            gradient: {
              from: "var(--color-dark)",
              to: "var(--color-primary)",
              direction: "to-r",
            },
          },
          textColor: "var(--color-light)",
          radius: 28,
          shadow: "md",
          align: { text: "left", items: "center", justify: "start" },
        },
      },
      preset_footer_dark: {
        name: "Footer Dark",
        style: {
          container: "full",
          padding: { top: 24, right: 0, bottom: 24, left: 0 },
          bg: { type: "solid", color: "var(--color-dark)" },
          textColor: "var(--color-light)",
          radius: 0,
          shadow: "none",
          align: { text: "left", items: "stretch", justify: "start" },
        },
      },
    },
    menus: {
      menu_main: {
        tree: [
          { id: "m1", label: "Home", type: "page", ref: { slug: "/" } },
          {
            id: "m2",
            label: "Products",
            type: "page",
            ref: { slug: "/products" },
          },
        ],
      },
      menu_footer: {
        tree: [
          { id: "f1", label: "About", type: "page", ref: { slug: "/about" } },
          {
            id: "f2",
            label: "Contact",
            type: "page",
            ref: { slug: "/contact" },
          },
        ],
      },
    },
    pages: {
      "/": {
        seo: {
          title: "Demo Store",
          description: "Preset + overrides styling demo.",
        },
        layout: {
          version: 1,
          sections: [
            {
              id: "sec_home",
              blocks: [
                {
                  id: "b1",
                  type: "Header/V1",
                  props: {
                    menuId: "menu_main",
                    ctaText: "Shop",
                    ctaHref: "/products",
                  },
                  style: {
                    presetId: "preset_header_light",
                    overrides: { padding: { bottom: 14 } },
                  },
                },
                {
                  id: "b2",
                  type: "Hero",
                  props: {
                    headline: "Users can style everything",
                    subhead:
                      "This hero uses a preset. We override only radius + top padding here.",
                    ctaText: "Browse Products",
                    ctaHref: "/products",
                  },
                  style: {
                    presetId: "preset_hero_gradient",
                    overrides: { radius: 34, padding: { top: 90 } },
                  },
                },
                {
                  id: "b3",
                  type: "ProductGrid/V1",
                  props: { title: "Featured Products", limit: 8 },
                  style: {
                    overrides: {
                      container: "boxed",
                      padding: { top: 24, right: 16, bottom: 24, left: 16 },
                      bg: { type: "solid", color: "rgba(0,0,0,0.02)" },
                      radius: 16,
                      shadow: "sm",
                    },
                  },
                },
                {
                  id: "b4",
                  type: "Footer/V1",
                  props: { menuId: "menu_footer" },
                  style: { presetId: "preset_footer_dark" },
                },
              ],
            },
          ],
        },
      },
    },
    templates: {
      product: { layout: { version: 1, sections: [] } },
      category: { layout: { version: 1, sections: [] } },
    },
  };

  // ✅ Typed collections: _id is string now
  const snapshots = db.collection<SnapshotDoc>("snapshots");
  const sites = db.collection<SiteDoc>("sites");

  await snapshots.updateOne(
    { _id: snapshot_id },
    { $set: snapshot },
    { upsert: true }
  );

  await sites.updateOne(
    { _id: site_id, tenant_id },
    {
      $set: {
        published_snapshot_id: snapshot_id,
        updated_at: new Date(),
        store_id,
      },
    }
  );

  console.log("Seeded Phase 4.1 snapshot ✅", { snapshot_id });
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
