import { requireSession } from "@acme/auth";
import PresetsEditorClient from "./presetsEditorClient";

export default async function PresetsPage({
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
      <h1 className="text-xl font-semibold">Style Presets</h1>
      <PresetsEditorClient siteId={siteId} urlMode={mode} />
    </div>
  );
}
