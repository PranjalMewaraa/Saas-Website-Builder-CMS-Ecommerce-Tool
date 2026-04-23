"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function SiteSwitcher() {
  const [sites, setSites] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const search = useSearchParams();
  const currentSiteId = search.get("site_id");
  const wrapRef = useRef<HTMLDivElement>(null);

  async function loadSites() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sites", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setSites(data?.sites || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const current = useMemo(
    () => sites.find((s) => s._id === currentSiteId),
    [sites, currentSiteId],
  );

  function switchTo(siteId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("site_id", siteId);
    router.push(url.pathname + url.search);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="grid grid-cols-5 items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="group col-span-4 flex h-10 min-w-0 w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 px-3 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.5)] backdrop-blur-md transition hover:border-slate-300 hover:bg-white"
        >
          <div className="min-w-0 text-left">
            <div className="truncate text-xs font-medium text-slate-500">
              Current Site
            </div>
            <div className="truncate text-sm font-semibold text-slate-900">
              {current?.name || "Select site"}
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        <button
          type="button"
          onClick={() => loadSites()}
          disabled={loading}
          className="col-span-1 inline-flex h-10 w-full items-center justify-center rounded-2xl border border-slate-200/80 bg-white/85 text-slate-600 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.5)] backdrop-blur-md transition hover:border-slate-300 hover:bg-white disabled:opacity-60"
          aria-label="Refresh sites"
          title="Refresh sites"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-[0_24px_40px_-24px_rgba(15,23,42,0.5)] backdrop-blur-xl">
          <div className="max-h-64 overflow-auto">
            {sites.map((s) => {
              const active = s._id === currentSiteId;
              return (
                <button
                  key={s._id}
                  onClick={() => switchTo(s._id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{s.name}</span>
                  {active ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-1 border-t border-slate-200 px-1 pt-1">
            <a
              href="/sites"
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Manage sites
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
