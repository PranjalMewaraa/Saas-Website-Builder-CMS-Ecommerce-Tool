import { requireSession } from "@acme/auth";
import { getMongoDb } from "@acme/db-mongo";

export async function PUT(req: Request) {
  const session = await requireSession();
  const { site_id, slug, seo } = await req.json();

  const tenant_id = session.user.tenant_id;
  const db = await getMongoDb();

  const res = await db.collection("snapshots").updateOne(
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

  return Response.json({ ok: true, modified: res.modifiedCount });
}
