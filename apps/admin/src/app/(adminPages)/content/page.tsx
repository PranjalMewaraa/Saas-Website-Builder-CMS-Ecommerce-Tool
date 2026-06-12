import Link from "next/link";
import { requireSession } from "@acme/auth";
import { getMongoDb } from "@acme/db-mongo";
import { pool } from "@acme/db-mysql";
import { Card, CardHeader, Badge, EmptyState, cn } from "@acme/ui";

const NAV_SECTIONS = [
  {
    title: "Content",
    items: [
      { title: "Pages", desc: "Layouts, blocks, SEO", hrefSuffix: "pages" },
      {
        title: "Assets",
        desc: "Images, videos, uploads",
        hrefSuffix: "assets",
      },
      { title: "Forms", desc: "Forms & submissions", hrefSuffix: "forms" },
      { title: "Menus", desc: "Navigation structure", hrefSuffix: "menus" },
    ],
  },
  {
    title: "Design",
    items: [
      { title: "Theme", desc: "Colors & typography", hrefSuffix: "theme" },
      { title: "Style Presets", desc: "Design tokens", hrefSuffix: "presets" },
      {
        title: "Section Templates",
        desc: "Reusable blocks",
        hrefSuffix: "templates",
      },
    ],
  },
  {
    title: "Publish & Settings",
    items: [
      { title: "Publish", desc: "Create live version", hrefSuffix: "publish" },
      {
        title: "Domains",
        desc: "Custom domains",
        hrefSuffix: "../settings/domains",
      },
      {
        title: "Commerce",
        desc: "Products & orders",
        hrefSuffix: "../commerce-v2",
      },
    ],
  },
];

// ────────────────────────────────────────────────
//  Data fetching & helpers (kept almost same, minor cleanup)
// ────────────────────────────────────────────────

async function getSiteStats(tenantId: string, siteId: string) {
  const db = await getMongoDb();

  const [
    site,
    totalSites,
    runningSites,
    pageCount,
    pagesWithSeo,
    assetsAgg,
    formsCount,
    submissionsCount,
    menus,
    snapshotsCount,
    latestSnapshot,
    blockTemplatesCount,
    sectionTemplatesCount,
  ] = await Promise.all([
    db.collection("sites").findOne({ _id: siteId, tenant_id: tenantId }),
    db.collection("sites").countDocuments({ tenant_id: tenantId }),
    db.collection("sites").countDocuments({
      tenant_id: tenantId,
      published_snapshot_id: { $type: "string" },
    }),
    db
      .collection("pages")
      .countDocuments({ tenant_id: tenantId, site_id: siteId }),
    db.collection("pages").countDocuments({
      tenant_id: tenantId,
      site_id: siteId,
      "seo.title": { $exists: true, $ne: "" },
    }),
    db
      .collection("assets_meta")
      .aggregate([
        {
          $match: {
            tenant_id: tenantId,
            site_id: siteId,
            is_deleted: { $ne: true },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalBytes: { $sum: { $ifNull: ["$size_bytes", 0] } },
          },
        },
      ])
      .next(),
    db
      .collection("forms")
      .countDocuments({ tenant_id: tenantId, site_id: siteId }),
    db
      .collection("form_submissions")
      .countDocuments({ tenant_id: tenantId, site_id: siteId }),
    db
      .collection("menus")
      .find({ tenant_id: tenantId, site_id: siteId })
      .toArray(),
    db
      .collection("snapshots")
      .countDocuments({ tenant_id: tenantId, site_id: siteId }),
    db
      .collection("snapshots")
      .find({ tenant_id: tenantId, site_id: siteId })
      .sort({ created_at: -1 })
      .limit(1)
      .next(),
    db
      .collection("block_templates")
      .countDocuments({ tenant_id: tenantId, site_id: siteId }),
    db
      .collection("section_templates")
      .countDocuments({ tenant_id: tenantId, site_id: siteId }),
  ]);

  return {
    site,
    totalSites,
    runningSites,
    pageCount,
    pagesWithSeo,
    assets: assetsAgg ?? { count: 0, totalBytes: 0 },
    formsCount,
    submissionsCount,
    menus: menus ?? [],
    snapshotsCount: snapshotsCount ?? 0,
    latestSnapshot,
    blockTemplatesCount: blockTemplatesCount ?? 0,
    sectionTemplatesCount: sectionTemplatesCount ?? 0,
  };
}

async function getCommerceStats(
  tenantId: string,
  storeId?: string,
  siteId?: string,
) {
  if (!storeId || !siteId)
    return { products: 0, publishedProducts: 0, orders: 0, storeName: "" };

  try {
    const [[{ c: products = "0" }]] = await pool.query(
      `SELECT COUNT(*) as c FROM store_products WHERE tenant_id = ? AND store_id = ?`,
      [tenantId, storeId],
    );

    const [[{ c: publishedProducts = "0" }]] = await pool.query(
      `SELECT COUNT(*) as c FROM store_products WHERE tenant_id = ? AND store_id = ? AND is_published = 1`,
      [tenantId, storeId],
    );

    const [[{ c: orders = "0" }]] = await pool.query(
      `SELECT COUNT(*) as c FROM commerce_orders WHERE tenant_id = ? AND site_id = ?`,
      [tenantId, siteId],
    );
    const [[storeRow]] = await pool.query(
      `SELECT name FROM stores WHERE tenant_id = ? AND id = ? LIMIT 1`,
      [tenantId, storeId],
    );

    return {
      products: Number(products),
      publishedProducts: Number(publishedProducts),
      orders: Number(orders),
      storeName: (storeRow as any)?.name || "",
    };
  } catch {
    return { products: 0, publishedProducts: 0, orders: 0, storeName: "" };
  }
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const val = bytes / 1024 ** i;
  return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatShortDate(date?: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────

export default async function ContentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const session = await requireSession();
  const tenantId = session.user.tenant_id;
  const { site_id = "site_demo" } = await searchParams;

  const stats = await getSiteStats(tenantId, site_id);
  const commerce = await getCommerceStats(
    tenantId,
    stats.site?.store_id,
    site_id,
  );

  if (!stats.site) {
    return (
      <Card className="mx-auto mt-10 max-w-lg">
        <EmptyState
          title="We couldn’t find this site"
          description={
            <>
              No site matches the current selection. Pick a different site from
              the switcher above, or create a new one.
            </>
          }
          action={
            <Link
              href="/sites"
              className="text-sm font-medium text-accent hover:underline"
            >
              Manage sites
            </Link>
          }
        />
      </Card>
    );
  }

  const hasPublished = !!stats.site.published_snapshot_id;
  const hasDraft = !!(stats.site as any).draft_snapshot_id;
  const assignedMenus = stats.menus.filter(
    (m) => m.slot === "header" || m.slot === "footer",
  ).length;

  const statCards: { label: string; value: string; helper: string }[] = [
    {
      label: "Live sites",
      value: `${stats.runningSites} / ${stats.totalSites}`,
      helper: "Published / total",
    },
    {
      label: "Pages",
      value: stats.pageCount.toString(),
      helper: `${stats.pagesWithSeo} with SEO`,
    },
    {
      label: "Assets",
      value: stats.assets.count.toString(),
      helper: formatBytes(stats.assets.totalBytes),
    },
    {
      label: "Forms",
      value: stats.formsCount.toString(),
      helper: `${stats.submissionsCount} submissions`,
    },
    {
      label: "Menus",
      value: stats.menus.length.toString(),
      helper: `${assignedMenus} assigned`,
    },
    {
      label: "Templates",
      value: `${stats.sectionTemplatesCount + stats.blockTemplatesCount}`,
      helper: `${stats.sectionTemplatesCount} section · ${stats.blockTemplatesCount} block`,
    },
    {
      label: "Products",
      value: commerce.products.toString(),
      helper: `${commerce.publishedProducts} live`,
    },
    {
      label: "Orders",
      value: commerce.orders.toString(),
      helper: "All time",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {stats.site.name || "Untitled site"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Overview of everything on this site.
          </p>
        </div>
        <Badge tone={hasPublished ? "live" : "draft"} dot>
          {hasPublished ? "Published" : "Draft only"}
        </Badge>
      </header>

      <section
        aria-label="Site stats"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((card) => (
          <Card key={card.label} className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {card.label}
            </p>
            <p className="font-display text-3xl font-semibold text-ink">
              {card.value}
            </p>
            <p className="text-sm text-muted">{card.helper}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-4">
          <CardHeader title="Publish status" />
          <dl className="space-y-2.5 text-sm">
            <Row label="Live version">
              <span className={cn(hasPublished ? "text-accent" : "text-draft")}>
                {hasPublished ? "Published" : "Draft only"}
              </span>
            </Row>
            <Row label="Draft snapshot">{hasDraft ? "Available" : "—"}</Row>
            <Row label="Latest publish">
              {formatShortDate(stats.latestSnapshot?.created_at)}
            </Row>
            <Row label="Snapshot versions">{stats.snapshotsCount}</Row>
          </dl>
        </Card>

        <Card className="space-y-4">
          <CardHeader title="Next steps" />
          <ul className="space-y-2.5 text-sm text-muted">
            <li>Assign header &amp; footer menus</li>
            <li>Add SEO titles &amp; descriptions</li>
            <li>Publish after major changes</li>
            <li>Keep an eye on asset storage</li>
          </ul>
        </Card>

        <Card className="space-y-4">
          <CardHeader title="This site" />
          <dl className="space-y-2.5 text-sm">
            <Row label="Site">{stats.site.name || "Untitled site"}</Row>
            <Row label="Store">
              {stats.site.store_id ? (
                commerce.storeName ||
                `Store ${stats.site.store_id.slice(-6)}`
              ) : (
                <span className="text-muted">Not connected</span>
              )}
            </Row>
          </dl>
        </Card>
      </section>

      <section className="space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {section.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {section.items.map((card) => (
                <Link
                  key={card.title}
                  href={
                    card.hrefSuffix.startsWith("..")
                      ? card.hrefSuffix
                      : `/content/${card.hrefSuffix}?site_id=${site_id}`
                  }
                  className="rounded-card border border-line bg-surface p-5 shadow-rest transition-colors hover:border-accent hover:bg-accent-soft/40"
                >
                  <h3 className="font-medium text-ink">{card.title}</h3>
                  <p className="mt-1 text-sm text-muted">{card.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}
