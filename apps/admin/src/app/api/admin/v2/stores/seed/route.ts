import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { seedStorePreset } from "@acme/db-mysql";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";
  const store_id = body.store_id || "";
  const preset = body.preset || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!store_id || !preset) {
    return NextResponse.json(
      { ok: false, error: "store_id and preset are required" },
      { status: 400 },
    );
  }

  const result = await seedStorePreset({ tenant_id, store_id, preset });
  return NextResponse.json({ ok: true, result });
}
