import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../packages/auth";
import { parseOrThrow } from "../../../../../../../packages/schemas";
import { ProductCreateSchema } from "../../../../../../../packages/schemas";
import {
  listProductsForStore,
  createProduct,
} from "../../../../../../../packages/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = searchParams.get("store_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!store_id) {
    return NextResponse.json(
      { ok: false, error: "Missing store_id" },
      { status: 400 }
    );
  }
  const products = await listProductsForStore({ tenant_id, store_id });
  return NextResponse.json({ ok: true, products });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  const body = await req.json();
  const input = parseOrThrow(ProductCreateSchema, body);

  const product = await createProduct(tenant_id, input);
  return NextResponse.json({ ok: true, product });
}
