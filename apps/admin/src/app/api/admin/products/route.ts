import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../packages/auth";
import { parseOrThrow } from "../../../../../../../packages/schemas";
import {
  ProductCreateSchema,
  ProductUpdateSchema,
} from "../../../../../../../packages/schemas";
import {
  listProductsForStore,
  listProductsForStoreFiltered,
  createProduct,
  getProduct,
  listProductCategoryIds,
  updateProduct,
  deleteProduct,
  setProductsStatus,
  setProductStatus,
} from "../../../../../../../packages/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = searchParams.get("store_id") || "";
  const product_id = searchParams.get("product_id") || "";
  const status = searchParams.get("status") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (product_id) {
    const product = await getProduct(tenant_id, product_id);
    const category_ids = product
      ? await listProductCategoryIds(tenant_id, product_id)
      : [];
    return NextResponse.json({ ok: true, product, category_ids });
  }

  if (!store_id) {
    return NextResponse.json(
      { ok: false, error: "Missing store_id" },
      { status: 400 },
    );
  }
  const products =
    status === "draft" || status === "active" || status === "archived"
      ? await listProductsForStoreFiltered({
          tenant_id,
          store_id,
          status: status as any,
        })
      : await listProductsForStore({ tenant_id, store_id });
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

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });

  const body = await req.json();
  const input = parseOrThrow(ProductUpdateSchema, body);

  const product = await updateProduct(tenant_id, input.product_id, input);
  if (!product) {
    return NextResponse.json(
      { ok: false, error: "Product not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, product });
}

export async function DELETE(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const product_id = searchParams.get("product_id") || "";
  const mode = searchParams.get("mode") || "soft";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!product_id) {
    return NextResponse.json(
      { ok: false, error: "Missing product_id" },
      { status: 400 },
    );
  }

  if (mode === "hard") {
    await deleteProduct(tenant_id, product_id);
    return NextResponse.json({ ok: true });
  }

  await setProductStatus(tenant_id, product_id, "archived");
  return NextResponse.json({ ok: true, archived: true });
}
