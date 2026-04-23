import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSnapshotById, getMongoDb } from "@acme/db-mongo";

export const dynamic = "force-dynamic";

export async function GET() {
  const h = await headers();
  const host = h.get("host")!;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const db = await getMongoDb();
  const sites = db.collection("sites");

  const site = await sites.findOne({});

  if (!site?.published_snapshot_id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const snapshot = await getSnapshotById(site.published_snapshot_id);

  const assets = snapshot?.assets || {};

  const images = Object.values(assets);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

<url>
  <loc>${protocol}://${host}</loc>

  ${images
    .map(
      (img: any) => `
  <image:image>
    <image:loc>${img.url}</image:loc>
  </image:image>`,
    )
    .join("")}

</url>
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
