import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getMongoDb, getSnapshotById, getSiteByHandle } from "@acme/db-mongo";

export const dynamic = "force-dynamic";

async function resolveSite() {
  const h = headers();
  const hostHeader = (await h).get("host") || "";
  const host = hostHeader.split(":")[0];

  const db = await getMongoDb();
  const sites = db.collection("sites");

  // -----------------------------
  // 1. Localhost → use ?handle=
  // -----------------------------
  if (host === "localhost" || host === "127.0.0.1") {
    const url = new URL((await h).get("x-url") || "http://localhost");
    const handle = url.searchParams.get("handle");

    if (handle) {
      const site = await sites.findOne({ handle });
      if (site) return site;
    }
  }

  // -----------------------------------
  // 2. Subdomain mode: handle.domain.com
  // -----------------------------------
  const parts = host.split(".");

  if (parts.length >= 3) {
    const handle = parts[0];
    const site = await sites.findOne({ handle });
    if (site) return site;
  }

  // -----------------------------
  // 3. Optional domain matching
  // -----------------------------
  const siteByDomain = await sites.findOne({
    $or: [
      { primary_domain: host },
      { domains: host },
      { "domains.host": host },
    ],
  });

  if (siteByDomain) return siteByDomain;

  // -----------------------------
  // 4. Fallback
  // -----------------------------
  return getSiteByHandle(process.env.DEFAULT_SITE_HANDLE || "demo-site");
}
function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const site = await resolveSite();

  if (!site?.published_snapshot_id) {
    return new NextResponse("Site not published", { status: 404 });
  }

  const snapshot = await getSnapshotById(site.published_snapshot_id);
  if (!snapshot?.pages) {
    return new NextResponse("Snapshot invalid", { status: 404 });
  }

  const h = headers();
  const host = (await h).get("host") || "";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const urls = Object.keys(snapshot.pages);

  const lastmod =
    snapshot.created_at instanceof Date
      ? snapshot.created_at.toISOString()
      : new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => {
    const loc = path === "/" ? baseUrl : `${baseUrl}${path}`;
    return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === "/" ? "1.0" : "0.7"}</priority>
  </url>`;
  })
  .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
