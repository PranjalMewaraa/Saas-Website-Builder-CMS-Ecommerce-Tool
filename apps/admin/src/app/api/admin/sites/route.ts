import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { getMongoDb, sitesCollection } from "@acme/db-mongo";
import { deleteStore } from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id");

  const col = await sitesCollection();
  if (site_id) {
    const site = await col.findOne({ _id: site_id, tenant_id });
    return NextResponse.json({ ok: true, site });
  }

  const sites = await col.find({ tenant_id }).toArray();

  return NextResponse.json({ ok: true, sites });
}

export async function DELETE(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id");

  if (!site_id) {
    return NextResponse.json(
      { ok: false, message: "Missing site_id" },
      { status: 400 }
    );
  }

  const db = await getMongoDb();
  const sitesCol = await sitesCollection();
  const site = await sitesCol.findOne({ _id: site_id, tenant_id });

  await Promise.all([
    db.collection("sites").deleteOne({ _id: site_id, tenant_id }),
    db.collection("snapshots").deleteMany({ site_id, tenant_id }),
    db.collection("pages").deleteMany({ site_id, tenant_id }),
    db.collection("themes").deleteMany({ site_id, tenant_id }),
    db.collection("menus").deleteMany({ site_id, tenant_id }),
    db.collection("assets").deleteMany({ site_id, tenant_id }),
    db.collection("forms").deleteMany({ site_id, tenant_id }),
    db.collection("form_submissions").deleteMany({ site_id, tenant_id }),
    db.collection("style_presets").deleteMany({ site_id, tenant_id }),
    db.collection("block_templates").deleteMany({ site_id, tenant_id }),
    db.collection("section_templates").deleteMany({ site_id, tenant_id }),
    db
      .collection("tenants")
      .updateOne(
        { _id: tenant_id, "onboarding.site_id": site_id },
        {
          $set: {
            "onboarding.site_id": null,
            "onboarding.step": "welcome",
            "onboarding.completed": false,
            updated_at: new Date(),
          },
        }
      ),
  ]);

  if (site?.store_id) {
    await deleteStore(tenant_id, site.store_id);
  }

  return NextResponse.json({ ok: true });
}
