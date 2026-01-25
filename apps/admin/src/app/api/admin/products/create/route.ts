import { requireSession, requireModule } from "@acme/auth";
import { createProductWithAttributes } from "@acme/db-mysql";
import { NextResponse } from "next/server";
createProductWithAttributes;

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const body = await req.json();
  const { site_id, store_id } = body;

  await requireModule({ tenant_id, site_id, module: "catalog" });

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
