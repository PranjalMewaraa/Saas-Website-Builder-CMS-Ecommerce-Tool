import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import {
  getMongoDb,
  getPageRevision,
  createPageRevision,
} from "@acme/db-mongo";
import { rebuildDraftSnapshot } from "@/lib/rebuildDraftSnapshot";

export async function POST(
  req: Request,
  context: { params: Promise<{ page_id: string; rev_id: string }> },
) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  await requireModule({ tenant_id, site_id, module: "builder" });

  const { page_id, rev_id } = await context.params;
  const rev = await getPageRevision({ tenant_id, revision_id: rev_id });
  if (!rev || rev.page_id !== page_id || rev.site_id !== site_id) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  const db = await getMongoDb();
  const col = db.collection("pages");
  const page = await col.findOne({
    _id: page_id as any,
    tenant_id,
    site_id,
  } as any);
  if (!page) {
    return NextResponse.json(
      { ok: false, error: "page_not_found" },
      { status: 404 },
    );
  }

  // snapshot the CURRENT draft as a revision so the restore is itself undoable
  await createPageRevision({
    tenant_id,
    site_id,
    page_id,
    slug: String((page as any).slug || rev.slug),
    name: (page as any).name ?? null,
    layout: (page as any).draft_layout,
    seo: (page as any).seo ?? null,
    actor_user_id: session.user.user_id,
    actor_name: session.user.name ?? session.user.email ?? null,
    note: `pre-restore of ${rev._id}`,
  }).catch(() => {});

  await col.updateOne(
    { _id: page_id as any, tenant_id, site_id } as any,
    {
      $set: {
        draft_layout: rev.layout,
        seo: rev.seo ?? (page as any).seo ?? {},
        updated_at: new Date(),
        updated_by: session.user.user_id,
      },
    } as any,
  );

  // capture the restored state as a revision too, with a clear note
  await createPageRevision({
    tenant_id,
    site_id,
    page_id,
    slug: String((page as any).slug || rev.slug),
    name: (page as any).name ?? null,
    layout: rev.layout,
    seo: rev.seo ?? (page as any).seo ?? null,
    actor_user_id: session.user.user_id,
    actor_name: session.user.name ?? session.user.email ?? null,
    note: `restored from ${rev._id}`,
  }).catch(() => {});

  await rebuildDraftSnapshot(tenant_id, site_id);
  return NextResponse.json({ ok: true });
}
