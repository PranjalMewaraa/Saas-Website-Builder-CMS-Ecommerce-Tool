import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { getPageRevision } from "@acme/db-mongo";

export async function GET(
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
  return NextResponse.json({ ok: true, revision: rev });
}
