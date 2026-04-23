import { requireSession } from "@acme/auth";
import { sitesCollection } from "@acme/db-mongo";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const body = await req.json();
  const { site_id, store_id } = body;

  if (!site_id || !store_id) {
    return Response.json(
      { ok: false, error: "Missing params" },
      { status: 400 },
    );
  }

  const col = await sitesCollection();

  const result = await col.updateOne(
    { _id: site_id, tenant_id },
    { $set: { store_id, updated_at: new Date() } },
  );

  if (!result.matchedCount) {
    return Response.json(
      { ok: false, error: "Site not found" },
      { status: 404 },
    );
  }

  return Response.json({ ok: true });
}
