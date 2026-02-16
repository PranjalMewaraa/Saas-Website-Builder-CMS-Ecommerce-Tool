import PageEditorStudioClient from "./pageEditorStudioClient";

export default async function PageEditorStudioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolved = await searchParams;
  const siteId = resolved.site_id || "";
  const pageId = resolved.page_id || "";
  const mode = resolved.mode;

  return <PageEditorStudioClient siteId={siteId} pageId={pageId} urlMode={mode} />;
}

