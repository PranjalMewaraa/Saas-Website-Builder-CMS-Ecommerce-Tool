import { requireSession } from "@acme/auth";
import FormsClient from "./formsClient";

export default async function FormsPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; mode?: string }>;
}) {
  await requireSession();

  // Await the promise – this is the correct & future-proof way
  const resolvedSearchParams = await searchParams;

  const siteId = resolvedSearchParams.site_id || "site_demo";
  const mode = resolvedSearchParams.mode || "";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Forms</h1>
      <FormsClient siteId={siteId} urlMode={mode} />
    </div>
  );
}
