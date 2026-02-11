import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../packages/auth";

import {
  BrandCreateSchema,
  parseOrThrow,
} from "../../../../../../../packages/schemas";
import {
  listBrands,
  listBrandsByStore,
  createBrandV2,
} from "@acme/db-mysql";
import { pool } from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = searchParams.get("store_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (store_id) {
    const brands = await listBrandsByStore({ tenant_id, store_id });
    return NextResponse.json({ ok: true, brands });
  }

  // Legacy compatibility read path.
  const brands = await listBrands(tenant_id);
  return NextResponse.json({ ok: true, brands });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = searchParams.get("store_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!store_id) {
    return NextResponse.json(
      {
        ok: false,
        error: "store_id is required. Brand creation is store-scoped in new system.",
      },
      { status: 400 },
    );
  }

  const [storeRows] = await pool.query<any[]>(
    `SELECT status FROM stores WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, store_id],
  );
  if (!storeRows[0]) {
    return NextResponse.json(
      { ok: false, error: "Store not found" },
      { status: 404 },
    );
  }
  if (String(storeRows[0].status) !== "active") {
    return NextResponse.json(
      { ok: false, error: "Store must be active to create brand" },
      { status: 400 },
    );
  }

  // Keep endpoint path for compatibility, but creation is now store-scoped.
  const body = await req.json();
  const input = parseOrThrow(BrandCreateSchema, body);

  const brand = await createBrandV2({
    tenant_id,
    store_id,
    name: input.name,
    type: body.type === "distributor" ? "distributor" : "brand",
    logo: body.logo || null,
    description: body.description || null,
  });
  return NextResponse.json({ ok: true, brand });
}
