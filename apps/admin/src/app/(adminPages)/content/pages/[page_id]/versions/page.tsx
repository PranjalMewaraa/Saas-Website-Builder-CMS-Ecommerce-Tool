import { requireSession, requireModule } from "@acme/auth";
import { listPageRevisions, getMongoDb } from "@acme/db-mongo";
import VersionsClient from "./VersionsClient";

export const dynamic = "force-dynamic";

export default async function PageVersions({
  params,
  searchParams,
}: {
  params: Promise<{ page_id: string }>;
  searchParams: Promise<{ site_id?: string }>;
}) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { page_id } = await params;
  const sp = await searchParams;
  const site_id = sp.site_id || "";
  await requireModule({ tenant_id, site_id, module: "builder" });

  const db = await getMongoDb();
  const page = await db.collection("pages").findOne({
    _id: page_id as any,
    tenant_id,
    site_id,
  } as any);

  const revisions = await listPageRevisions({
    tenant_id,
    site_id,
    page_id,
    limit: 50,
  });

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Version history</h1>
        <p className="text-sm text-slate-600">
          {(page as any)?.name || (page as any)?.slug || page_id} ·{" "}
          {revisions.length} revision{revisions.length === 1 ? "" : "s"}
        </p>
        <p className="text-xs text-slate-500">
          The 50 most recent versions are kept per page. Restoring a version
          also saves the current state as a new revision, so the action is
          itself undoable.
        </p>
      </header>

      {revisions.length === 0 ? (
        <p className="text-sm text-slate-600">
          No versions yet. Edit and save the page to create the first one.
        </p>
      ) : (
        <VersionsClient
          siteId={site_id}
          pageId={page_id}
          revisions={revisions.map((r) => ({
            id: r._id,
            actor_name: r.actor_name || r.actor_user_id,
            note: r.note ?? null,
            created_at:
              r.created_at instanceof Date
                ? r.created_at.toISOString()
                : String(r.created_at),
          }))}
        />
      )}
    </div>
  );
}
