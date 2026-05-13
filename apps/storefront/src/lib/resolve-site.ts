import { getMongoDb } from "@acme/db-mongo";

export type ResolvedSite = {
  _id: string;
  tenant_id: string;
  store_id?: string;
  handle: string;
};

export async function resolveSiteFromRequest(
  req: Request,
  bodyHint?: { site_id?: string; handle?: string },
): Promise<ResolvedSite | null> {
  const db = await getMongoDb();
  const sites = db.collection("sites");

  if (bodyHint?.site_id) {
    const site = await sites.findOne({ _id: bodyHint.site_id as any });
    if (site) return site as any;
  }
  if (bodyHint?.handle) {
    const site = await sites.findOne({ handle: bodyHint.handle });
    if (site) return site as any;
  }

  const host = (req.headers.get("host") || "").split(":")[0];
  const url = new URL(req.url);
  const handleFromQuery = url.searchParams.get("handle");

  if (handleFromQuery) {
    const site = await sites.findOne({ handle: handleFromQuery });
    if (site) return site as any;
  }

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    const subdomain = host.split(".")[0];
    if (subdomain) {
      const site = await sites.findOne({ handle: subdomain });
      if (site) return site as any;
    }
  }

  const fallback = process.env.DEFAULT_SITE_HANDLE;
  if (fallback) {
    const site = await sites.findOne({ handle: fallback });
    if (site) return site as any;
  }

  return null;
}
