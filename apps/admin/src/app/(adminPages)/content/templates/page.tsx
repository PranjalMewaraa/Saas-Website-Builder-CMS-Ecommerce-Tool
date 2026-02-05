import { requireSession } from "@acme/auth";
import TemplatesEditorClient from "./templatesEditorClient";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  await requireSession();

  const params = await searchParams;
  const siteId = params.site_id || "site_demo";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Templates</h1>
      <TemplatesEditorClient siteId={siteId} />
    </div>
  );
}
