export function buildSeo(snapshot: any, slug: string) {
  const page = snapshot.pages?.[slug] || {};
  const pageSeo = page.seo || {};
  const siteSeo = snapshot.site_seo || {};
  const assets = snapshot.assets || {};

  const siteName = siteSeo.siteName || "";

  const rawTitle = pageSeo.title || siteName || "";

  const title = siteSeo.titleTemplate
    ? siteSeo.titleTemplate
        .replace("{page}", rawTitle)
        .replace("{site}", siteName)
    : rawTitle;

  const description = pageSeo.description || siteSeo.defaultDescription || "";

  const ogImage =
    assets[pageSeo.ogImageAssetId]?.url ||
    assets[siteSeo.globalOgImageAssetId]?.url ||
    undefined;

  return {
    title,
    description,
    ogImage,
    robots: pageSeo.robots,
    canonical: pageSeo.canonical,
  };
}
