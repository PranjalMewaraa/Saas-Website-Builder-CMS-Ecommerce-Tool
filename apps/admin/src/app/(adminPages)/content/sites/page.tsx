"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NewSiteClient from "./NewSiteClient";

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sites")
      .then((r) => r.json())
      .then((d) => setSites(d.sites || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Sites</h1>

        <NewSiteClient
          onCreated={(site: any) => setSites((prev) => [site, ...prev])}
        />
      </div>

      <div className="grid gap-4">
        {sites.map((s) => (
          <div
            key={s._id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">{s.handle}</div>
            </div>

            <Link
              href={`/content/pages?site_id=${s._id}`}
              className="text-sm underline"
            >
              Open Admin → Pages
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
