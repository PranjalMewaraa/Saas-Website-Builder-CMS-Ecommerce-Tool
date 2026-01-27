import { requireSession } from "@acme/auth";
import PreviewClient from "./previewClient";

interface PreviewPageProps {
  searchParams: Promise<{ site_id?: string; handle?: string }>;
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  // Await the searchParams promise (this is now required)
  const params = await searchParams;

  await requireSession();

  // Use the resolved values with fallback
  const siteId = params.site_id || "site_demo";
  const handle = params.handle || "demo-site";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Draft Preview</h1>
      <PreviewClient siteId={siteId} handle={handle} />
    </div>
  );
}
