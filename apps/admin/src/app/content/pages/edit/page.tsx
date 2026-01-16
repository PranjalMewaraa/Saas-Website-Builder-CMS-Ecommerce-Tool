import { requireSession } from "@acme/auth";
import PageEditorClient from "./pageEditorClient";

export default async function EditPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; page_id?: string }>;
}) {
  await requireSession();

  // Await here (or destructure after await)
  const resolvedSearchParams = await searchParams;

  const siteId = resolvedSearchParams.site_id || "site_demo";
  const pageId = resolvedSearchParams.page_id || "";

  return <PageEditorClient siteId={siteId} pageId={pageId} />;
}
