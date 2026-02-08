import { requireSession } from "@acme/auth";
import SubmissionsClient from "./submissionClient";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; form_id?: string }>;
}) {
  await requireSession();
  const params = await searchParams;
  const siteId = params.site_id || "site_demo";
  const formId = params.form_id || "";
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Form Submissions</h1>
      <SubmissionsClient siteId={siteId} formId={formId} />
    </div>
  );
}
