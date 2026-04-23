import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { createSite } from "@acme/db-mongo/sites.repo";
import { getOrCreateHomePage } from "@acme/db-mongo/pages.repo";
import { updateTenantOnboarding } from "@acme/db-mongo/tenants.repo";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { name, handle } = await req.json();
  if (!name || !handle) {
    return NextResponse.json(
      { ok: false, error: "Missing fields" },
      { status: 400 },
    );
  }

  const site_id = id("site");

  await createSite({
    site_id,
    tenant_id,
    name,
    handle,
  });
  await getOrCreateHomePage(tenant_id, site_id);

  await updateTenantOnboarding(tenant_id, {
    completed: true,
    step: "done",
    site_id,
  });

  return NextResponse.json({ ok: true, site_id });
}
