import { requireSession } from "@acme/auth";
import AssetsClient from "./assetsClient";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  await requireSession();

  // Await here – now it's the resolved plain object
  const resolvedSearchParams = await searchParams;
  const siteId = resolvedSearchParams.site_id || "site_demo";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Assets</h1>
      <AssetsClient siteId={siteId} />
    </div>
  );
}
