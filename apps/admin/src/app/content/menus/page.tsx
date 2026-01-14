import { requireSession } from "@acme/auth";
import MenusEditorClient from "./menusEditorClient";

export default async function MenusPage({
  searchParams,
}: {
  searchParams: { site_id?: string; mode?: string };
}) {
  await requireSession();
  const siteId = searchParams.site_id || "site_demo";
  const mode = searchParams.mode || "";
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Menus</h1>
      <MenusEditorClient siteId={siteId} urlMode={mode} />
    </div>
  );
}
