"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ContentNavClient() {
  const sp = useSearchParams();
  const siteId = sp.get("site_id") || "site_demo";
  const qp = `?site_id=${encodeURIComponent(siteId)}`;

  return (
    <div className="border-b p-3 flex flex-wrap gap-3">
      <Link href={`/content${qp}`} className="font-semibold">
        Content
      </Link>
      <Link href={`/content/theme${qp}`}>Theme</Link>
      <Link href={`/content/menus${qp}`}>Menus</Link>
      <Link href={`/content/pages/home${qp}`}>Pages</Link>
      <Link href={`/content/presets${qp}`}>Presets</Link>
      <Link href={`/content/publish${qp}`}>Publish</Link>
    </div>
  );
}
