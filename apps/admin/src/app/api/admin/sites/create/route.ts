import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { sitesCollection } from "@acme/db-mongo/sites.repo";

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Name required" },
      { status: 400 },
    );
  }

  const handle = slugify(name);
  const site_id = `site_${Date.now()}`;

  const col = await sitesCollection();

  const doc = {
    _id: site_id,
    tenant_id,
    store_id: `store_${Date.now()}`,
    name,
    handle,
    modules_enabled: {
      catalog: true,
      builder: true,
      themes: true,
      menus: true,
      forms: true,
      assets: true,
      custom_entities: true,
    },
    published_snapshot_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  await col.insertOne(doc as any);

  return NextResponse.json({ ok: true, site: doc });
}
