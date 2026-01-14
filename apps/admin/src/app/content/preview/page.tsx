import { requireSession } from "@acme/auth";
import PreviewClient from "./previewClient";

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: { site_id?: string; handle?: string };
}) {
  await requireSession();
  const siteId = searchParams.site_id || "site_demo";
  const handle = searchParams.handle || "demo-site";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Draft Preview</h1>
      <PreviewClient siteId={siteId} handle={handle} />
    </div>
  );
}
