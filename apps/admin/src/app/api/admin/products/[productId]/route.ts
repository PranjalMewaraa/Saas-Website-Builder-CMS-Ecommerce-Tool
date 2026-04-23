import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../../packages/auth";
import { deleteProduct } from "../../../../../../../../packages/db-mysql";

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  await deleteProduct(tenant_id, params.productId);
  return NextResponse.json({ ok: true });
}
