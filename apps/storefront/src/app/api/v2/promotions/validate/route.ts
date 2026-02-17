"use server";

import { NextResponse } from "next/server";
import { evaluatePromotions } from "@acme/db-mysql";
import { getMongoDb } from "@acme/db-mongo";

async function resolveSite(body: any, req: Request) {
  const db = await getMongoDb();
  const sites = db.collection("sites");
  if (body?.site_id) {
    const site = await sites.findOne({ _id: body.site_id });
    if (site) return site;
  }
  if (body?.handle) {
    const site = await sites.findOne({ handle: body.handle });
    if (site) return site;
  }
  const host = (req.headers.get("host") || "").split(":")[0];
  const search = req.headers.get("x-search") || req.url || "";
  let handle: string | null = null;
  if (search.includes("?")) {
    const url = new URL(search, "http://localhost");
    handle = url.searchParams.get("handle");
  }
  if ((host === "localhost" || host === "127.0.0.1") && handle) {
    const site = await sites.findOne({ handle });
    if (site) return site;
  }
  return null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const site = await resolveSite(body, req);
  if (!site) {
    return NextResponse.json({ ok: false, error: "Site not found" }, { status: 404 });
  }
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return NextResponse.json({ ok: true, applied: null, candidates: [] });
  }
  const evaluated = await evaluatePromotions({
    tenant_id: String(site.tenant_id),
    site_id: String(site._id),
    store_id: String(site.store_id),
    items: items.map((i: any) => ({
      product_id: String(i.product_id || ""),
      variant_id: i.variant_id ? String(i.variant_id) : undefined,
      qty: Math.max(1, Number(i.qty || 1)),
    })),
    coupon_code: body.coupon_code ? String(body.coupon_code) : undefined,
    customer: body.customer || {},
    include_secret: true,
  });
  if (body.coupon_code && !evaluated.applied) {
    return NextResponse.json(
      { ok: false, error: "Invalid or ineligible coupon" },
      { status: 400 },
    );
  }
  return NextResponse.json({
    ok: true,
    subtotal_cents: evaluated.subtotal_cents,
    applied: evaluated.applied || null,
    candidates: evaluated.candidates || [],
    total_cents: Math.max(
      0,
      Number(evaluated.subtotal_cents || 0) -
        Number(evaluated.applied?.discount_cents || 0),
    ),
  });
}

