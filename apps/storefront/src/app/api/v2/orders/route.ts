"use server";

import { NextResponse } from "next/server";
import { getMongoDb } from "@acme/db-mongo";
import { placeOrderV2 } from "@acme/db-mysql";

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
  const body = await req.json();
  const site = await resolveSite(body, req);
  if (!site) {
    return NextResponse.json({ ok: false, error: "Site not found" }, { status: 404 });
  }
  if (!Array.isArray(body.items) || !body.items.length) {
    return NextResponse.json({ ok: false, error: "Empty cart" }, { status: 400 });
  }

  try {
    const result = await placeOrderV2({
      tenant_id: site.tenant_id,
      site_id: String(site._id),
      store_id: String(site.store_id),
      currency: body.currency || "INR",
      customer: body.customer || {},
      shipping: body.shipping_address || {},
      coupon_code: body.coupon_code ? String(body.coupon_code) : undefined,
      items: body.items.map((i: any) => ({
        product_id: String(i.product_id),
        variant_id: i.variant_id ? String(i.variant_id) : undefined,
        qty: Number(i.qty || 1),
      })),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    const msg = String(e?.message || "Order failed");
    if (msg.startsWith("INSUFFICIENT_INVENTORY")) {
      return NextResponse.json({ ok: false, error: msg }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
