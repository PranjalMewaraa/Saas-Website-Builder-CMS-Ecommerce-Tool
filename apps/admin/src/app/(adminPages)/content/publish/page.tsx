import { requireSession } from "@acme/auth";
import { getSite } from "@acme/db-mongo";
import PublishClient from "./publishClient";

export default async function PublishPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const resolved = await searchParams;
  const siteId = resolved.site_id || "site_demo";
  const session = await requireSession();
  const site = await getSite(siteId, session.user.tenant_id);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Publish</h1>
      <PublishClient siteId={siteId} siteName={site?.name || ""} />
    </div>
  );
}
