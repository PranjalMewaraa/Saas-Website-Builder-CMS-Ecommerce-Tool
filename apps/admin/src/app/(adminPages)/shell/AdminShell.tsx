"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Menu,
  Palette,
  Brush,
  Image,
  FormInput,
  Eye,
  Code2,
  Store,
  Tags,
  Package,
  ShoppingBag,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  Save,
  GlobeIcon,
} from "lucide-react";
import { SiteSwitcher } from "@/app/_components/SiteSwitcher";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
};

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
    {
      label: "Dashboard",
      href: "/content",
      icon: LayoutDashboard,
      group: "Content",
    },
    {
      label: "Your Sites",
      href: "/content/sites",
      icon: GlobeIcon,
      group: "Content",
    },
    {
      label: "Pages",
      href: "/content/pages",
      icon: FileText,
      group: "Content",
    },
    { label: "Menus", href: "/content/menus", icon: Menu, group: "Content" },
    { label: "Theme", href: "/content/theme", icon: Palette, group: "Content" },
    {
      label: "Style Presets",
      href: "/content/presets",
      icon: Brush,
      group: "Content",
    },
    { label: "Assets", href: "/content/assets", icon: Image, group: "Content" },
    {
      label: "Forms",
      href: "/content/forms",
      icon: FormInput,
      group: "Content",
    },
    {
      label: "Previews",
      href: "/content/preview",
      icon: Eye,
      group: "Content",
    },

    { label: "Builder", href: "/builder", icon: Code2, group: "Build" },

    { label: "My Store", href: "/stores", icon: Store, group: "Commerce" },
    { label: "Brands", href: "/brands", icon: Tags, group: "Commerce" },
    { label: "Categories", href: "/categories", icon: Tags, group: "Commerce" },
    {
      label: "Products",
      href: "/products",
      icon: ShoppingBag,
      group: "Commerce",
    },

    {
      label: "Domains",
      href: "/settings/domains",
      icon: Globe,
      group: "Settings",
    },
    {
      label: "Store Settings",
      href: "/settings/store",
      icon: Settings,
      group: "Settings",
    },
  ];

  const grouped = useMemo(() => {
    const g: Record<string, NavItem[]> = {};
    nav.forEach((item) => {
      const key = item.group || "Other";
      if (!g[key]) g[key] = [];
      g[key].push(item);
    });
    return g;
  }, []);

  function withSite(href: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("site_id", siteId);
    return `${href}?${params.toString()}`;
  }

  const [draftSiteId, setDraftSiteId] = useState(siteId);
  // Only one group can be open at a time → store the active group name (or null)
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  function applySiteId(next: string) {
    const trimmed = next.trim() || "site_demo";
    setDraftSiteId(trimmed);
    const params = new URLSearchParams(searchParams.toString());
    params.set("site_id", trimmed);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function toggleGroup(group: string) {
    setActiveGroup((prev) => (prev === group ? null : group));
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 grid grid-cols-[260px_1fr]">
      {/* Sidebar – fixed, no scroll */}
      <aside className="bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* Brand / Logo */}
        <div className="p-5 border-b border-gray-200 shrink-0">
          <div className="text-xl font-bold text-gray-900">Admin Panel</div>
          <div className="text-xs text-gray-500 mt-0.5">Manage your sites</div>
        </div>

        {/* Site Selector */}
        <div className="p-4 border-b border-gray-200 shrink-0">
          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
            Active Site
          </label>
          <SiteSwitcher />
          <p className="mt-1.5 text-[11px] text-gray-500">
            All links include <code className="font-mono">site_id</code>
          </p>
        </div>

        {/* Navigation – scrollable if needed, but with exclusive accordion it usually fits */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {Object.entries(grouped).map(([group, items]) => {
            const isOpen = activeGroup === group;

            return (
              <div
                key={group}
                className="rounded-md overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => toggleGroup(group)}
                  className={`
                    flex items-center justify-between w-full px-4 py-3 text-sm font-semibold
                    ${isOpen ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}
                    transition-colors
                  `}
                >
                  {group}
                  {isOpen ? (
                    <ChevronDown size={16} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-500" />
                  )}
                </button>

                <div
                  className={`
                    transition-all duration-300 ease-in-out
                    ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}
                    overflow-hidden bg-white
                  `}
                >
                  <div className="py-1.5 px-1 space-y-0.5">
                    {items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={withSite(item.href)}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 text-sm rounded-md mx-1
                            transition-all
                            ${
                              isActive
                                ? "bg-blue-600 text-white font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }
                          `}
                        >
                          <item.icon
                            className={
                              isActive ? "text-white" : "text-gray-500"
                            }
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs text-gray-500">Active Site</div>
              <div className="font-semibold text-gray-900 truncate">
                {siteId}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={withSite("/content")}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Content
              </Link>
              <Link
                href={withSite("/builder")}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Builder
              </Link>
              <Link
                href={withSite("/content/publish")}
                className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2"
              >
                <Save size={16} />
                Publish
              </Link>
            </div>
          </div>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
