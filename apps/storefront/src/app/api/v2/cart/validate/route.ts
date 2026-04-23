"use server";

import { NextResponse } from "next/server";
import { pool } from "@acme/db-mysql";
import { getMongoDb } from "@acme/db-mongo";

async function resolveTenant(body: any) {
  if (body?.tenant_id) return String(body.tenant_id);
  const db = await getMongoDb();
  const sites = db.collection("sites");
  let site: any = null;
  if (body?.site_id) site = await sites.findOne({ _id: body.site_id });
  if (!site && body?.handle) site = await sites.findOne({ handle: body.handle });
  return site?.tenant_id ? String(site.tenant_id) : "";
}

export async function POST(req: Request) {
  const body = await req.json();
  const tenant_id = await resolveTenant(body);
  const items = Array.isArray(body.items) ? body.items : [];
  if (!tenant_id || !items.length) {
    return NextResponse.json({ ok: true, items: [] });
  }

  const result: any[] = [];
  for (const item of items) {
    const product_id = String(item.product_id || "");
    if (!product_id) continue;
    const variant_id = item.variant_id ? String(item.variant_id) : "";
    const qty = Number(item.qty || 1);
    const [rows] = await pool.query<any[]>(
      `SELECT v.id, v.inventory_qty
       FROM product_variants v
       WHERE v.tenant_id = ? AND v.product_id = ?
       ${variant_id ? "AND v.id = ?" : ""}
       ORDER BY v.created_at ASC
       LIMIT 1`,
      variant_id ? [tenant_id, product_id, variant_id] : [tenant_id, product_id],
    );
    const row = rows[0];
    const available = Number(row?.inventory_qty || 0);
    result.push({
      product_id,
      variant_id: row?.id || variant_id || null,
      requested_qty: qty,
      available_qty: available,
      ok: available >= qty,
      out_of_stock: available <= 0,
      low_stock: available > 0 && available <= 5,
    });
  }

  return NextResponse.json({ ok: true, items: result });
}
