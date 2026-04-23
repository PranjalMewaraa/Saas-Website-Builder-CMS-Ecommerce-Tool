import { requireSession, requireModule } from "@acme/auth";
import { createBrandV2 } from "@acme/db-mysql";
import { NextResponse } from "next/server";
import { pool } from "@acme/db-mysql";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";
  const store_id = String(body.store_id || "");

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!store_id) {
    return NextResponse.json(
      { ok: false, error: "store_id is required" },
      { status: 400 },
    );
  }

  // For "new system", enforce active store-scoped brands only.
  const [storeRows] = await pool.query<any[]>(
    `SELECT store_type, status FROM stores WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, store_id],
  );
  const store = storeRows[0];
  if (!store) {
    return NextResponse.json(
      { ok: false, error: "Store not found" },
      { status: 404 },
    );
  }
  if (String(store.status) !== "active") {
    return NextResponse.json(
      { ok: false, error: "Store must be active to create brand/distributor" },
      { status: 400 },
    );
  }

  if (String(store.store_type) === "brand") {
    const [countRows] = await pool.query<any[]>(
      `SELECT COUNT(*) as c
       FROM brand_profiles
       WHERE tenant_id = ? AND store_id = ? AND type = 'brand'`,
      [tenant_id, store_id],
    );
    if (Number(countRows[0]?.c || 0) >= 1) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This store type allows only one brand. Edit existing brand or use a distributor store.",
        },
        { status: 400 },
      );
    }
  }

  const brand = await createBrandV2({
    tenant_id,
    store_id,
    name: body.name,
    type: body.type === "distributor" ? "distributor" : "brand",
    logo: body.logo || null,
    description: body.description || null,
  });
  return NextResponse.json({ ok: true, brand });
}
