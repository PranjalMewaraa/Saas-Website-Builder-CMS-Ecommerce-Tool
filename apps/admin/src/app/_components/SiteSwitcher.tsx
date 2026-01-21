"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function SiteSwitcher() {
  const [sites, setSites] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const search = useSearchParams();
  const currentSiteId = search.get("site_id");

  useEffect(() => {
    fetch("/api/admin/sites")
      .then((r) => r.json())
      .then((d) => setSites(d.sites || []));
  }, []);

  const current = sites.find((s) => s._id === currentSiteId);

  function switchTo(siteId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("site_id", siteId);
    router.push(url.pathname + url.search);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full border rounded px-3 py-2 text-sm"
      >
        <span>{current?.name || "Select site"}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 bg-white border rounded shadow mt-1 z-50">
          {sites.map((s) => (
            <button
              key={s._id}
              onClick={() => switchTo(s._id)}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              {s.name}
            </button>
          ))}

          <div className="border-t">
            <a href="/sites" className="block px-3 py-2 text-sm text-blue-600">
              Manage sites →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
