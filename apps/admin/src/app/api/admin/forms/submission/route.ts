import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { listFormSubmissions } from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const form_id = searchParams.get("form_id") || "";
  const limit = Number(searchParams.get("limit") || 200);

  await requireModule({ tenant_id, site_id, module: "forms" });

  const subs = await listFormSubmissions({
    tenant_id,
    site_id,
    form_id: form_id || undefined,
    limit,
  });
  return NextResponse.json({ ok: true, submissions: subs });
}
