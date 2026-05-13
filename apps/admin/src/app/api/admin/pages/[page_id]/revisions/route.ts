import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { listPageRevisions } from "@acme/db-mongo";

export async function GET(
  req: Request,
  context: { params: Promise<{ page_id: string }> },
) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  await requireModule({ tenant_id, site_id, module: "builder" });

  const { page_id } = await context.params;
  const limit = Number(searchParams.get("limit") || 50);
  const offset = Number(searchParams.get("offset") || 0);

  const revisions = await listPageRevisions({
    tenant_id,
    site_id,
    page_id,
    limit,
    offset,
  });

  return NextResponse.json({
    ok: true,
    revisions: revisions.map((r) => ({
      id: r._id,
      slug: r.slug,
      name: r.name,
      actor_user_id: r.actor_user_id,
      actor_name: r.actor_name,
      note: r.note,
      created_at: r.created_at,
    })),
  });
}
