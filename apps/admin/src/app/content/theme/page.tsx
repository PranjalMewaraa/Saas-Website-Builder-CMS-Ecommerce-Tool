import { requireSession } from "@acme/auth";
import ThemeEditorClient from "./themeEditorClient";

export default async function ThemePage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; mode?: string }>;
}) {
  await requireSession();

  // Await the promise to get the actual object
  const resolvedSearchParams = await searchParams;

  const siteId = resolvedSearchParams.site_id || "site_demo";
  const mode = resolvedSearchParams.mode || "";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Theme</h1>
      <ThemeEditorClient siteId={siteId} urlMode={mode} />
    </div>
  );
}
