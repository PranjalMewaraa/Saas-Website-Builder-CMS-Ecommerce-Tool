import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getMongoDb, getSnapshotById, getSiteByHandle } from "@acme/db-mongo";

export const dynamic = "force-dynamic";

async function resolveSite() {
  const h = headers();
  const hostRaw = (await h).get("host") || "";
  const host = hostRaw.split(":")[0];

  const db = await getMongoDb();
  const sites = db.collection("sites");

  const site =
    (await sites.findOne({
      $or: [
        { primary_domain: host },
        { domains: host },
        { "domains.host": host },
      ],
    })) || null;

  if (site) return site;

  const fallback = process.env.DEFAULT_SITE_HANDLE || "demo-site";
  return await getSiteByHandle(fallback);
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
