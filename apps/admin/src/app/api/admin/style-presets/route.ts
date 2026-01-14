import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { listStylePresets, upsertStylePreset } from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const presets = await listStylePresets(tenant_id, site_id);
  return NextResponse.json({ ok: true, presets });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();

  await upsertStylePreset({
    _id: body._id,
    tenant_id,
    site_id,
    name: body.name,
    target: body.target,
    style: body.style,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json({ ok: true });
}
