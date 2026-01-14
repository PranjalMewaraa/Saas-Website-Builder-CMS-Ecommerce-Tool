import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../../packages/auth";
import { safeDeleteBrand } from "../../../../../../../../packages/db-mysql";

export async function DELETE(
  req: Request,
  { params }: { params: { brandId: string } }
) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  await safeDeleteBrand(tenant_id, params.brandId);
  return NextResponse.json({ ok: true });
}
