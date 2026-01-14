import { requireSession } from "@acme/auth";
import PublishClient from "./publishClient";

export default async function PublishPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  await requireSession();

  const resolved = await searchParams;
  const siteId = resolved.site_id || "site_demo";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Publish</h1>
      <PublishClient siteId={siteId} />
    </div>
  );
}
