import { requireSession, requireModule } from "@acme/auth";
import { createCategory } from "@acme/db-mysql";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  const category = await createCategory(tenant_id, { name: body.name });
  return NextResponse.json({ ok: true, category });
}
