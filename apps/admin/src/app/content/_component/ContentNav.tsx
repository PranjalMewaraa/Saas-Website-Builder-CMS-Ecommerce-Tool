"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const navItems = [
  { href: "/content", label: "Dashboard" },
  { href: "/content/pages/home", label: "Pages" }, // Highest priority: core structure & hierarchy
  // General content/posts/entries overview
  { href: "/content/theme", label: "Theme" }, // Design & appearance – often early in workflow
  { href: "/content/menus", label: "Menus" }, // Navigation structure – closely tied to pages
  { href: "/content/assets", label: "Assets" }, // Media library – used across pages/content
  { href: "/content/forms", label: "Forms" }, // Functional/interactive elements
  { href: "/content/presets", label: "Presets" }, // Templates/shortcuts – mid-to-late
  { href: "/content/preview", label: "Preview" }, // Testing/viewing changes
  { href: "/content/publish", label: "Publish" }, // Final action – usually last
];

function isActive(pathname: string, href: string) {
  // Exact match for /content, prefix match for the rest
  if (href === "/content") return pathname === "/content";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function ContentNav() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const siteId = sp.get("site_id") || "site_demo";
  const mode = sp.get("mode"); // keep editor mode if present

  const qp =
    `?site_id=${encodeURIComponent(siteId)}` +
    (mode ? `&mode=${encodeURIComponent(mode)}` : "");

  return (
    <>
      {/* Sidebar – hidden on mobile, fixed-width on desktop */}
      <aside className="hidden md:block w-64 border-r bg-white shrink-0">
        <div className="sticky top-0 p-6 h-screen overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Content</h2>
            <div className="mt-2 text-xs text-gray-500 break-all">
              site_id: <span className="font-mono">{siteId}</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={`${item.href}${qp}`}
                  className={`
                    block px-4 py-2.5 text-sm font-medium rounded-lg
                    transition-colors duration-150
                    ${
                      active
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile: horizontal scrollable tabs */}
      <div className="md:hidden border-b bg-white sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-4 overflow-x-auto">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={`${item.href}${qp}`}
                className={`
                  text-sm font-medium whitespace-nowrap px-1 py-2 border-b-2
                  ${
                    active
                      ? "border-black text-black"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
