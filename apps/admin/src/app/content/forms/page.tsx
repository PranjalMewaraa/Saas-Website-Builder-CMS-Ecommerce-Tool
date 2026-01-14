import { requireSession } from "@acme/auth";
import FormsClient from "./formsClient";

export default async function FormsPage({
  searchParams,
}: {
  searchParams: { site_id?: string; mode?: string };
}) {
  await requireSession();
  const siteId = searchParams.site_id || "site_demo";
  const mode = searchParams.mode || "";
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Forms</h1>
      <FormsClient siteId={siteId} urlMode={mode} />
    </div>
  );
}
