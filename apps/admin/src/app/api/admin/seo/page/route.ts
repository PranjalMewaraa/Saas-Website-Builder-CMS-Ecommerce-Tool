import { requireSession } from "@acme/auth";
import { getMongoDb } from "@acme/db-mongo";

export async function PUT(req: Request) {
  const session = await requireSession();
  const { site_id, slug, seo } = await req.json();

  const tenant_id = session.user.tenant_id;
  const db = await getMongoDb();

  // 1️⃣ Update draft page document
  const pagesRes = await db.collection("pages").updateOne(
    {
      tenant_id,
      site_id,
      slug,
    },
    {
      $set: {
        seo,
        updated_at: new Date(),
        updated_by: session.user.user_id,
      },
    },
  );

  // 2️⃣ Update draft snapshot for live preview
  const snapshotRes = await db.collection("snapshots").updateOne(
    {
      tenant_id,
      site_id,
      is_draft: true,
    },
    {
      $set: {
        "pages.$[p].seo": seo,
      },
    },
    {
      arrayFilters: [{ "p.slug": slug }],
    },
  );

  return Response.json({
    ok: true,
    pages_modified: pagesRes.modifiedCount,
    snapshot_modified: snapshotRes.modifiedCount,
  });
}
