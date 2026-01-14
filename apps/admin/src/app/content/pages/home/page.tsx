import { requireSession } from "@acme/auth";
import HomePageEditorClient from "./homePageEditorClient";

export default async function HomeEditPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; mode?: string }>;
}) {
  await requireSession();

  const params = await searchParams;

  const siteId = params.site_id || "site_demo";
  const mode = params.mode || "";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Edit Home Page</h1>
      <HomePageEditorClient siteId={siteId} urlMode={mode} />
    </div>
  );
}
