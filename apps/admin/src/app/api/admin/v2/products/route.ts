import { NextResponse } from "next/server";
import { requireModule, requireSession } from "@acme/auth";
import {
  createProductV2,
  getProductV2,
  listProductsV2,
  updateProductV2,
} from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = searchParams.get("store_id") || "";
  const product_id = searchParams.get("product_id") || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!store_id) {
    return NextResponse.json(
      { ok: false, error: "store_id is required" },
      { status: 400 },
    );
  }

  if (product_id) {
    const product = await getProductV2({ tenant_id, store_id, product_id });
    return NextResponse.json({ ok: true, product });
  }

  const products = await listProductsV2({ tenant_id, store_id });
  return NextResponse.json({ ok: true, products });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });

  const required = [
    "store_id",
    "store_category_id",
    "title",
    "base_price_cents",
    "inventory_quantity",
  ];
  const missing = required.filter((k) => body[k] == null || body[k] === "");
  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: `Missing: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const product = await createProductV2({
      tenant_id,
      site_id,
      store_id: body.store_id,
      title: body.title,
      description: body.description || null,
      base_price_cents: Number(body.base_price_cents),
      sku: body.sku || null,
      inventory_quantity: Number(body.inventory_quantity),
      status: body.status || "draft",
      brand_id: body.brand_id || null,
      store_category_id: body.store_category_id,
      attributes: body.attributes || {},
      image_urls: Array.isArray(body.image_urls) ? body.image_urls.map(String) : [],
      variants: Array.isArray(body.variants) ? body.variants : undefined,
    });
    return NextResponse.json({ ok: true, product });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to create product" },
      { status: 400 },
    );
  }
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!body.store_id || !body.product_id) {
    return NextResponse.json(
      { ok: false, error: "store_id and product_id are required" },
      { status: 400 },
    );
  }

  try {
    const product = await updateProductV2({
      tenant_id,
      store_id: String(body.store_id),
      product_id: String(body.product_id),
      title: body.title == null ? undefined : String(body.title),
      description: body.description === undefined ? undefined : body.description,
      base_price_cents:
        body.base_price_cents == null ? undefined : Number(body.base_price_cents),
      sku: body.sku === undefined ? undefined : body.sku,
      inventory_quantity:
        body.inventory_quantity == null ? undefined : Number(body.inventory_quantity),
      status: body.status,
      brand_id: body.brand_id === undefined ? undefined : body.brand_id,
      store_category_id:
        body.store_category_id === undefined ? undefined : body.store_category_id,
      attributes: body.attributes && typeof body.attributes === "object" ? body.attributes : undefined,
      variants: Array.isArray(body.variants) ? body.variants : undefined,
    });
    return NextResponse.json({ ok: true, product });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to update product" },
      { status: 400 },
    );
  }
}
