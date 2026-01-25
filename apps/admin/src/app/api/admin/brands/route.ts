import { NextResponse } from "next/server";
import {
  requireSession,
  requireModule,
} from "../../../../../../../packages/auth";

import {
  BrandCreateSchema,
  parseOrThrow,
} from "../../../../../../../packages/schemas";
import { listBrands, createBrand } from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  const brands = await listBrands(tenant_id);
  return NextResponse.json({ ok: true, brands });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  const body = await req.json();
  const input = parseOrThrow(BrandCreateSchema, body);

  const brand = await createBrand(tenant_id, input);
  return NextResponse.json({ ok: true, brand });
}
