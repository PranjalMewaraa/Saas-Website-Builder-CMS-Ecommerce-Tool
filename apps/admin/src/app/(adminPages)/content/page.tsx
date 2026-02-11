import Link from "next/link";

export default async function ContentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const params = await searchParams;
  const siteId = params.site_id || "site_demo";

  const cards = [
    {
      title: "Pages",
      desc: "Edit layouts, blocks, SEO",
      href: `/content/pages?site_id=${siteId}`,
    },
    {
      title: "Menus",
      desc: "Header/footer menus",
      href: `/content/menus?site_id=${siteId}`,
    },
    {
      title: "Theme",
      desc: "Design tokens + brand identity",
      href: `/content/theme?site_id=${siteId}`,
    },
    {
      title: "Style Presets",
      desc: "Reusable styling presets",
      href: `/content/presets?site_id=${siteId}`,
    },
    {
      title: "Assets",
      desc: "Upload + organize images",
      href: `/content/assets?site_id=${siteId}`,
    },
    {
      title: "Forms",
      desc: "Form builder + submissions",
      href: `/content/forms?site_id=${siteId}`,
    },
    {
      title: "Section Templates",
      desc: "Reusable sections for builder",
      href: `/content/templates?site_id=${siteId}`,
    },
    {
      title: "Publish",
      desc: "Publish immutable snapshot",
      href: `/content/publish?site_id=${siteId}`,
    },
    {
      title: "Domains",
      desc: "Map custom domains to this site",
      href: `/settings/domains?site_id=${siteId}`,
    },
    {
      title: "Commerce V2",
      desc: "Store preset + category attributes + inventory",
      href: `/commerce-v2?site_id=${siteId}`,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Content Dashboard</h1>
        <div className="text-sm opacity-70">
          Everything UI-related lives here for site: {siteId}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="border rounded-xl bg-white p-4 hover:bg-neutral-50"
          >
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm opacity-70 mt-1">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
