"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@acme/ui";

export function SiteSwitcher({ activeSiteId }: { activeSiteId?: string }) {
  const [sites, setSites] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const search = useSearchParams();
  const currentSiteId = search.get("site_id") || activeSiteId || "";
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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-control border border-line bg-surface px-3 text-left transition-colors hover:bg-canvas"
        >
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-medium text-muted">
              Current site
            </span>
            <span className="block truncate text-sm font-semibold text-ink">
              {current?.name || "Select a site"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={() => loadSites()}
          disabled={loading}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-muted transition-colors hover:bg-canvas disabled:opacity-50"
          aria-label="Refresh site list"
          title="Refresh site list"
        >
          <RefreshCw
            className={cn("h-4 w-4", loading && "animate-spin")}
            aria-hidden="true"
          />
        </button>
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-card border border-line bg-surface p-1 shadow-raised"
        >
          <div className="max-h-64 overflow-auto">
            {sites.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted">
                {loading ? "Loading sites…" : "No sites yet"}
              </p>
            )}
            {sites.map((s) => {
              const active = s._id === currentSiteId;
              return (
                <button
                  key={s._id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => switchTo(s._id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-control px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-fg"
                      : "text-ink hover:bg-canvas",
                  )}
                >
                  <span className="truncate">{s.name}</span>
                  {active && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1 border-t border-line pt-1">
            <a
              href="/sites"
              className="block rounded-control px-3 py-2 text-sm font-medium text-ink hover:bg-canvas"
            >
              Manage sites
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
