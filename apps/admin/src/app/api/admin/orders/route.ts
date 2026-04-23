import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { listOrders } from "@acme/db-mongo";
import { pool } from "@acme/db-mysql";

function parseMaybeJson(value: any) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return {};
  }
}

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const status = searchParams.get("status") || "";

  if (!site_id) {
    return NextResponse.json({ ok: false, error: "site_id required" }, { status: 400 });
  }

  const [v2] = await pool.query<any[]>(
    `SELECT *
     FROM commerce_orders
     WHERE tenant_id = ? AND site_id = ?
     ${status ? "AND status = ?" : ""}
     ORDER BY created_at DESC`,
    status ? [tenant_id, site_id, status] : [tenant_id, site_id],
  );

  const v2Mapped = (v2 || []).map((o) => ({
    _id: o.id,
    order_number: o.order_number,
    status: o.status,
    total_cents: o.total_cents,
    customer: parseMaybeJson(o.customer_json),
    shipping_address: parseMaybeJson(o.shipping_json),
    created_at: o.created_at,
    source: "mysql_v2",
  }));

  const legacy = await listOrders(tenant_id, site_id, status || undefined);
  return NextResponse.json({ ok: true, orders: [...v2Mapped, ...legacy] });
}
