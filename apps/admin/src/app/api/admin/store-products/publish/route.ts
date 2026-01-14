import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../../packages/auth";
import { parseOrThrow } from "../../../../../../../../packages/schemas";
import { StoreProductPublishSchema } from "../../../../../../../../packages/schemas";
import { setStoreProductPublished } from "../../../../../../../../packages/db-mysql";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  const body = await req.json();
  const input = parseOrThrow(StoreProductPublishSchema, body);

  await setStoreProductPublished({
    tenant_id,
    store_id: input.store_id,
    product_id: input.product_id,
    is_published: input.is_published,
  });

  return NextResponse.json({ ok: true });
}
