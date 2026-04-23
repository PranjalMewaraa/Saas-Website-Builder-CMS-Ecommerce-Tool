import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { parseOrThrow } from "@acme/schemas";
import { z } from "zod";
import { deleteProducts, setProductsStatus } from "@acme/db-mysql";

const BulkSchema = z.object({
  action: z.enum(["archive", "restore", "delete"]),
  product_ids: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });

  const body = await req.json();
  const input = parseOrThrow(BulkSchema, body);

  if (input.action === "delete") {
    await deleteProducts(tenant_id, input.product_ids);
    return NextResponse.json({ ok: true });
  }

  if (input.action === "archive") {
    await setProductsStatus(tenant_id, input.product_ids, "archived");
    return NextResponse.json({ ok: true, archived: true });
  }

  await setProductsStatus(tenant_id, input.product_ids, "draft");
  return NextResponse.json({ ok: true, restored: true });
}
