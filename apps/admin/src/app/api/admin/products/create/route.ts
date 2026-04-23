import { requireSession, requireModule } from "@acme/auth";
import { createProductWithAttributes } from "@acme/db-mysql";
import { NextResponse } from "next/server";
import { resolveStoreId } from "@/lib/store-scope";
createProductWithAttributes;

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const body = await req.json();
  const { site_id } = body;
  const store_id = await resolveStoreId({
    tenant_id,
    site_id,
    store_id: String(body.store_id || ""),
  });

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!store_id) {
    return NextResponse.json(
      { ok: false, error: "store_id is required" },
      { status: 400 },
    );
  }

  const product_id = await createProductWithAttributes({
    tenant_id,
    store_id,
    title: body.title,
    description: body.description,
    brand_id: body.brand_id,
    base_price_cents: body.base_price_cents,
    category_ids: body.category_ids,
    attributes: body.attributes,
    variants: body.variants,
  });

  return NextResponse.json({ ok: true, product_id });
}
