import { requireSession, requireModule } from "@acme/auth";
import { createProductWithAttributes } from "@acme/db-mysql";
import { NextResponse } from "next/server";
import {
  parseOrThrow,
  ProductCreateWithAttributesSchema,
} from "@acme/schemas";
import { resolveStoreId } from "@/lib/store-scope";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  let input;
  try {
    input = parseOrThrow(ProductCreateWithAttributesSchema, await req.json());
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || "Invalid input") },
      { status: 400 },
    );
  }

  const site_id = input.site_id ?? "";
  const store_id = await resolveStoreId({
    tenant_id,
    site_id,
    store_id: input.store_id ?? "",
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
    title: input.title,
    description: input.description ?? undefined,
    brand_id: input.brand_id ?? null,
    base_price_cents: input.base_price_cents,
    category_ids: input.category_ids ?? [],
    attributes: input.attributes ?? [],
    variants: input.variants ?? [],
  });

  return NextResponse.json({ ok: true, product_id });
}
