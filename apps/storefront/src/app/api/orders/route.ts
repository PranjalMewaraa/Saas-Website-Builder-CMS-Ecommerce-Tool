"use server";

import { NextResponse } from "next/server";
import { getMongoDb, getSiteByHandle } from "@acme/db-mongo";

async function resolveSite(req: Request) {
  const host = (req.headers.get("host") || "").split(":")[0];
  const search = req.headers.get("x-search") || req.url || "";
  let handle: string | null = null;
  if (search.includes("?")) {
    const url = new URL(search, "http://localhost");
    handle = url.searchParams.get("handle");
  }

  const db = await getMongoDb();
  const sites = db.collection("sites");

  if ((host === "localhost" || host === "127.0.0.1") && handle) {
    const site = await sites.findOne({ handle });
    if (site) return site;
  }

  const parts = host.split(".");
  if (parts.length >= 3) {
    const site = await sites.findOne({ handle: parts[0] });
    if (site) return site;
  }

  return getSiteByHandle(process.env.DEFAULT_SITE_HANDLE || "pranjal-site");
}

function newOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`.toUpperCase();
}

export async function POST(req: Request) {
  const body = await req.json();
  let site = null as any;
  if (body?.site_id) {
    const db = await getMongoDb();
    site = await db.collection("sites").findOne({ _id: body.site_id });
  } else if (body?.handle) {
    const db = await getMongoDb();
    site = await db.collection("sites").findOne({ handle: body.handle });
  } else {
    site = await resolveSite(req);
  }
  if (!site) {
    return NextResponse.json({ ok: false, error: "Site not found" }, { status: 404 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const subtotal_cents = Number(body.subtotal_cents || 0);
  const total_cents = Number(body.total_cents || subtotal_cents);

  const order = {
    _id: `order_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    tenant_id: site.tenant_id,
    site_id: site._id,
    store_id: site.store_id,
    order_number: newOrderNumber(),
    status: "new",
    items,
    subtotal_cents,
    total_cents,
    currency: "INR",
    customer: body.customer || {},
    shipping_address: body.shipping_address || {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  const db = await getMongoDb();
  await db.collection("orders").insertOne(order as any);

  return NextResponse.json({ ok: true, order_number: order.order_number });
}
