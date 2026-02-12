import Link from "next/link";
import { requireSession } from "@acme/auth";
import { getMongoDb } from "@acme/db-mongo";
import { pool } from "@acme/db-mysql";

type DashboardCard = {
  title: string;
  value: string;
  helper?: string;
  accent?: boolean;
};

type NavigationCard = {
  title: string;
  description: string;
  href: string;
  icon?: string; // optional – you can add lucide-react / heroicons later
};

// ────────────────────────────────────────────────
//  Config
// ────────────────────────────────────────────────

const ANALYTICS_CARDS: DashboardCard[] = [
  { title: "Live Sites", value: "", helper: "Published / Total", accent: true },
  { title: "Assets", value: "", helper: "" },
  { title: "Pages", value: "", helper: "" },
  { title: "Forms", value: "", helper: "Forms • Submissions" },
  { title: "Menus", value: "", helper: "" },
  { title: "Templates", value: "", helper: "" },
  { title: "Products", value: "", helper: "Published", accent: true },
  { title: "Orders", value: "", helper: "" },
];

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
    return { products: 0, publishedProducts: 0, orders: 0 };

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

    return {
      products: Number(products),
      publishedProducts: Number(publishedProducts),
      orders: Number(orders),
    };
  } catch {
    return { products: 0, publishedProducts: 0, orders: 0 };
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
      <div className="mx-auto max-w-5xl py-12 text-center">
        <h2 className="text-2xl font-semibold text-neutral-900">
          Site not found
        </h2>
        <p className="mt-3 text-neutral-500">ID: {site_id}</p>
      </div>
    );
  }

  const hasPublished = !!stats.site.published_snapshot_id;
  const hasDraft = !!(stats.site as any).draft_snapshot_id;
  const assignedMenus = stats.menus.filter(
    (m) => m.slot === "header" || m.slot === "footer",
  ).length;

  // Prepare display values
  const displayStats = [
    `${stats.runningSites} / ${stats.totalSites}`,
    stats.assets.count.toString(),
    stats.pageCount.toString(),
    `${stats.formsCount} • ${stats.submissionsCount}`,
    stats.menus.length.toString(),
    `${stats.sectionTemplatesCount + stats.blockTemplatesCount}`,
    commerce.products.toString(),
    commerce.orders.toString(),
  ];

  ANALYTICS_CARDS.forEach((card, i) => {
    card.value = displayStats[i]!;
    if (card.title === "Assets")
      card.helper = formatBytes(stats.assets.totalBytes);
    if (card.title === "Pages") card.helper = `${stats.pagesWithSeo} with SEO`;
    if (card.title === "Menus") card.helper = `${assignedMenus} assigned`;
    if (card.title === "Templates")
      card.helper = `${stats.sectionTemplatesCount} section • ${stats.blockTemplatesCount} block`;
    if (card.title === "Products")
      card.helper = `${commerce.publishedProducts} live`;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-5 py-8 md:px-8 lg:py-12">
      {/* Header */}
      <header className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Dashboard
        </h1>
        <p className="text-base text-neutral-500">
          Site Selected •{" "}
          <span className="font-medium text-neutral-700">{site_id}</span>
        </p>
      </header>

      {/* Stats – glass-like cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ANALYTICS_CARDS.map((card) => (
          <div
            key={card.title}
            className={`
              group relative overflow-hidden rounded-2xl border border-neutral-200/70 
              bg-white/70 backdrop-blur-xl shadow-sm transition-all duration-300
              hover:border-neutral-300 hover:shadow-md hover:shadow-neutral-200/40
              ${card.accent ? "ring-1 ring-blue-500/30" : ""}
            `}
          >
            <div className="px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {card.title}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
                {card.value}
              </p>
              {card.helper && (
                <p className="mt-1.5 text-sm text-neutral-500">{card.helper}</p>
              )}
            </div>

            {/* subtle shine / gradient accent on hover */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="h-full w-full bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
            </div>
          </div>
        ))}
      </section>

      {/* Status + Checklist + Scope – horizontal cards */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Publish Status */}
        <div className="rounded-2xl border border-neutral-200/70 bg-white/70 backdrop-blur-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">
            Publish Status
          </h3>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Live version</span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${hasPublished ? "bg-green-500" : "bg-amber-500"}`}
                />
                <span
                  className={
                    hasPublished
                      ? "text-green-700"
                      : "text-amber-700 font-medium"
                  }
                >
                  {hasPublished ? "Published" : "Draft only"}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Draft snapshot</span>
              <span>{hasDraft ? "Available" : "—"}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Latest publish</span>
              <span>{formatShortDate(stats.latestSnapshot?.created_at)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Snapshot versions</span>
              <span>{stats.snapshotsCount}</span>
            </div>
          </div>
        </div>

        {/* Quick Checklist */}
        <div className="rounded-2xl border border-neutral-200/70 bg-white/70 backdrop-blur-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">
            Quick Checklist
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm text-neutral-600">
            <li className="flex items-center gap-2">
              <span className="text-neutral-400">•</span> Assign header & footer
              menus
            </li>
            <li className="flex items-center gap-2">
              <span className="text-neutral-400">•</span> Add SEO titles &
              descriptions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-neutral-400">•</span> Publish after major
              changes
            </li>
            <li className="flex items-center gap-2">
              <span className="text-neutral-400">•</span> Monitor asset storage
              usage
            </li>
          </ul>
        </div>

        {/* Context */}
        <div className="rounded-2xl border border-neutral-200/70 bg-white/70 backdrop-blur-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">
            Workspace Scope
          </h3>
          <div className="mt-5 space-y-3 text-sm text-neutral-600">
            <p>
              Showing data for site{" "}
              <strong className="text-neutral-800">{site_id}</strong>
            </p>
            <p>
              Store:{" "}
              {stats.site.store_id ? (
                <span className="font-medium text-neutral-800">
                  {stats.site.store_id}
                </span>
              ) : (
                <span className="italic text-neutral-400">not connected</span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Navigation – grouped */}
      <section className="space-y-8">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-800">
              {section.title}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {section.items.map((card) => (
                <Link
                  key={card.title}
                  href={
                    card.hrefSuffix.startsWith("..")
                      ? card.hrefSuffix
                      : `/content/${card.hrefSuffix}?site_id=${site_id}`
                  }
                  className={`
                    group rounded-2xl border border-neutral-200/70 bg-white/70 
                    px-6 py-5 shadow-sm backdrop-blur-xl transition-all duration-300
                    hover:border-neutral-300 hover:shadow-md hover:shadow-neutral-200/50
                    active:scale-[0.98]
                  `}
                >
                  <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-neutral-500">{card.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
