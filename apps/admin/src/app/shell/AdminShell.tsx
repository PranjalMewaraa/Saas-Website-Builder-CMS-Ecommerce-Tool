"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = { label: string; href: string; group?: string };

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const siteId = searchParams.get("site_id") || "site_demo";

  const nav: NavItem[] = [
    { label: "Content Dashboard", href: "/content", group: "UI" },
    { label: "Pages", href: "/content/pages/home", group: "UI" },
    { label: "Menus", href: "/content/menus", group: "UI" },
    { label: "Theme", href: "/content/theme", group: "UI" },
    { label: "Style Presets", href: "/content/presets", group: "UI" },
    { label: "Assets", href: "/content/assets", group: "UI" },
    { label: "Forms", href: "/content/forms", group: "UI" },
    { label: "Previews", href: "/content/preview", group: "UI" },

    { label: "Builder", href: "/builder", group: "Build" },

    { label: "My Store", href: "/stores", group: "Commerce" },
    { label: "Brands", href: "/brands", group: "Commerce" },
    { label: "Categories", href: "/categories", group: "Commerce" },
    { label: "Products", href: "/products", group: "Commerce" },

    { label: "Domains", href: "/settings/domains", group: "Settings" },
    { label: "Store Settings", href: "/settings/store", group: "Settings" },
  ];

  const grouped = useMemo(() => {
    const g: Record<string, NavItem[]> = {};
    for (const item of nav) (g[item.group || "Other"] ||= []).push(item);
    return g;
  }, []);

  function withSite(href: string) {
    const u = new URL(href, "http://x");
    u.searchParams.set("site_id", siteId);
    return u.pathname + "?" + u.searchParams.toString();
  }

  const [draftSiteId, setDraftSiteId] = useState(siteId);

  function applySiteId(nextSiteId: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("site_id", nextSiteId);
    router.replace(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="min-h-screen text-gray-950 grid grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="border-r bg-white">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Admin</div>
          <div className="text-xs opacity-70">Tenant workspace</div>
        </div>

        <div className="p-4 space-y-4">
          {/* Site selector */}
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase opacity-60">
              Active Site
            </div>
            <div className="flex gap-2">
              <input
                className="border rounded px-3 py-2 text-sm w-full"
                value={draftSiteId}
                onChange={(e) => setDraftSiteId(e.target.value)}
                placeholder="site_demo"
              />
              <button
                className="border rounded px-3 py-2 text-sm"
                type="button"
                onClick={() => applySiteId(draftSiteId.trim() || "site_demo")}
              >
                Go
              </button>
            </div>
            <div className="text-[11px] opacity-60">
              All navigation preserves{" "}
              <span className="font-mono">site_id</span>.
            </div>
          </div>

          {/* Navigation */}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="space-y-2">
              <div className="text-xs font-medium uppercase opacity-60">
                {group}
              </div>
              <div className="space-y-1">
                {items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={withSite(item.href)}
                      className={[
                        "block rounded px-3 py-2 text-sm border",
                        active
                          ? "bg-black text-white border-black"
                          : "bg-white hover:bg-neutral-50",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm opacity-70">Active Site</div>
              <div className="font-semibold truncate">{siteId}</div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-50"
                href={withSite("/content")}
              >
                Content
              </Link>
              <Link
                className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-50"
                href={withSite("/builder")}
              >
                Builder
              </Link>
              <Link
                className="bg-black text-white rounded px-3 py-2 text-sm"
                href={withSite("/content/publish")}
              >
                Publish
              </Link>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
