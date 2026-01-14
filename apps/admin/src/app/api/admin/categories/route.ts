import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../packages/auth";
import { parseOrThrow } from "../../../../../../../packages/schemas";
import { CategoryCreateSchema } from "../../../../../../../packages/schemas";
import {
  listCategories,
  createCategory,
} from "../../../../../../../packages/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  const categories = await listCategories(tenant_id);
  return NextResponse.json({ ok: true, categories });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  const body = await req.json();
  const input = parseOrThrow(CategoryCreateSchema, body);

  const category = await createCategory(tenant_id, input);
  return NextResponse.json({ ok: true, category });
}
