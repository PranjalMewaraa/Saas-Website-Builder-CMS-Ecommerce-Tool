import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../packages/auth";
import { parseOrThrow } from "../../../../../../../packages/schemas";
import { CategoryCreateSchema } from "../../../../../../../packages/schemas";
import {
  listCategories,
  listStoreCategories,
  createStoreCategory,
} from "../../../../../../../packages/db-mysql";
import { pool } from "@acme/db-mysql";
import { resolveStoreId } from "@/lib/store-scope";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = await resolveStoreId({
    tenant_id,
    site_id,
    store_id: searchParams.get("store_id") || "",
  });

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (store_id) {
    const categories = await listStoreCategories({ tenant_id, store_id });
    return NextResponse.json({ ok: true, categories });
  }

  // Legacy compatibility read path.
  const categories = await listCategories(tenant_id);
  return NextResponse.json({ ok: true, categories });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = await resolveStoreId({
    tenant_id,
    site_id,
    store_id: searchParams.get("store_id") || "",
  });

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!store_id) {
    return NextResponse.json(
      {
        ok: false,
        error: "store_id is required. Category creation is store-scoped in new system.",
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
      { ok: false, error: "Store must be active to create category" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const input = parseOrThrow(CategoryCreateSchema, body);

  const category = await createStoreCategory({
    tenant_id,
    store_id,
    name: input.name,
    slug: input.slug,
    parent_id: input.parent_id ?? null,
  });
  return NextResponse.json({ ok: true, category });
}
