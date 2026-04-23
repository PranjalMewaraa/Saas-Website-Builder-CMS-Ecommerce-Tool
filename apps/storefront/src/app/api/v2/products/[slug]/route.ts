"use server";

import { NextResponse } from "next/server";
import { getMongoDb } from "@acme/db-mongo";
import { getProductV2BySlug } from "@acme/db-mysql";

async function resolveSite(handle?: string | null) {
  const db = await getMongoDb();
  const sites = db.collection("sites");
  if (handle) {
    const site = await sites.findOne({ handle });
    if (site) return site;
  }
  return null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle") || "";
  const site_id = searchParams.get("site_id") || "";

  let site: any = null;
  const db = await getMongoDb();
  const sites = db.collection("sites");
  if (site_id) site = await sites.findOne({ _id: site_id } as any);
  if (!site) site = await resolveSite(handle);
  if (!site) {
    return NextResponse.json({ ok: false, error: "Site not found" }, { status: 404 });
  }

  const product = await getProductV2BySlug({
    tenant_id: site.tenant_id,
    store_id: site.store_id,
    slug,
  });

  if (!product) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, product });
}
