import { NextResponse } from "next/server";
import { requireModule, requireSession } from "@acme/auth";
import { createBrandV2, listBrandsByStore, pool } from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = searchParams.get("store_id") || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!store_id) {
    return NextResponse.json(
      { ok: false, error: "store_id is required" },
      { status: 400 },
    );
  }

  const brands = await listBrandsByStore({ tenant_id, store_id });
  return NextResponse.json({ ok: true, brands });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!body.store_id || !body.name) {
    return NextResponse.json(
      { ok: false, error: "store_id and name are required" },
      { status: 400 },
    );
  }

  const [storeRows] = await pool.query<any[]>(
    `SELECT status FROM stores WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, body.store_id],
  );
  if (!storeRows[0]) {
    return NextResponse.json(
      { ok: false, error: "Store not found" },
      { status: 404 },
    );
  }
  if (String(storeRows[0].status) !== "active") {
    return NextResponse.json(
      { ok: false, error: "Store must be active to create brand/distributor" },
      { status: 400 },
    );
  }

  const brand = await createBrandV2({
    tenant_id,
    store_id: body.store_id,
    name: body.name,
    type: body.type === "distributor" ? "distributor" : "brand",
    logo: body.logo || null,
    description: body.description || null,
  });
  return NextResponse.json({ ok: true, brand });
}
