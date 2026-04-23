import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const h = headers();
  const host = (await h).get("host") || "";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const sitemapUrl = `${protocol}://${host}/sitemap.xml`;

  const txt = `
User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;

  return new NextResponse(txt.trim(), {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
