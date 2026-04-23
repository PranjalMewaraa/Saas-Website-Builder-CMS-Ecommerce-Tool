import { NextResponse } from "next/server";
import { requireModule, requireSession } from "@acme/auth";
import { adjustInventory, getInventorySnapshot, pool } from "@acme/db-mysql";
import { getSite } from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const site = site_id ? await getSite(site_id, tenant_id) : null;
  const store_id = String(site?.store_id || "");
  const q = searchParams.get("q") || "";
  const product_id = searchParams.get("product_id") || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!store_id) {
    return NextResponse.json(
      { ok: false, error: "Active store is not set for this site" },
      { status: 400 },
    );
  }
  if (product_id) {
    const [logs] = await pool.query<any[]>(
      `SELECT * FROM inventory_logs
       WHERE tenant_id = ? AND store_id = ? AND product_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [tenant_id, store_id, product_id],
    );
    return NextResponse.json({ ok: true, logs, store_id });
  }
  const items = await getInventorySnapshot({ tenant_id, store_id, q });
  return NextResponse.json({ ok: true, items, store_id });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";
  const site = site_id ? await getSite(site_id, tenant_id) : null;
  const store_id = String(site?.store_id || "");
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!store_id || !body.product_id || body.delta_quantity == null) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Active store is required and product_id, delta_quantity must be provided",
      },
      { status: 400 },
    );
  }
  try {
    const result = await adjustInventory({
      tenant_id,
      store_id,
      product_id: body.product_id,
      variant_id: body.variant_id || undefined,
      change_type:
        body.change_type === "restock" ? "restock" : "manual_adjustment",
      delta_quantity: Number(body.delta_quantity),
      changed_by: session.user.email || session.user.id,
      reason: body.reason || "",
    });
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Inventory update failed" },
      { status: 400 },
    );
  }
}
