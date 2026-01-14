import { requireSession } from "@acme/auth";
import Link from "next/link";

export default async function ContentDashboard({
  searchParams,
}: {
  searchParams: { site_id?: string };
}) {
  await requireSession();
  const siteId = searchParams.site_id || "site_demo";

  const qp = `?site_id=${encodeURIComponent(siteId)}`;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Content Manager</h1>
      <div className="opacity-70">
        Site: <b>{siteId}</b>
      </div>

      <div className="grid gap-3 max-w-xl">
        <Link className="border rounded p-3" href={`/content/theme${qp}`}>
          Edit Theme
        </Link>
        <Link className="border rounded p-3" href={`/content/menus${qp}`}>
          Edit Menus
        </Link>
        <Link className="border rounded p-3" href={`/content/pages/home${qp}`}>
          Edit Home Page
        </Link>
        <Link className="border rounded p-3" href={`/content/presets${qp}`}>
          Edit Style Presets
        </Link>
        <Link
          className="border rounded p-3 bg-black text-white"
          href={`/content/publish${qp}`}
        >
          Publish
        </Link>
      </div>
    </div>
  );
}
