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
  ShoppingBag,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  Save,
  GlobeIcon,
  ChartCandlestick,
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

  const siteId = searchParams.get("site_id") || "";
  const hasSite = !!siteId; // ✅ NEW

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
      label: "Site SEO",
      href: "/content/seo",
      icon: ChartCandlestick,
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
      label: "Form Submissions",
      href: "/content/forms/submissions",
      icon: FileText,
      group: "Manage",
    },
    {
      label: "Previews",
      href: "/content/preview",
      icon: Eye,
      group: "Content",
    },
    // { label: "Builder", href: "/builder", icon: Code2, group: "Build" },
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
      label: "Orders",
      href: "/orders",
      icon: ShoppingBag,
      group: "Commerce",
    },
    {
      label: "Order Management",
      href: "/orders",
      icon: ShoppingBag,
      group: "Manage",
    },
    {
      label: "Inventory Management",
      href: "/manage/inventory",
      icon: ShoppingBag,
      group: "Manage",
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
    {
      label: "Plugins",
      href: "/settings/plugins",
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
    if (siteId) params.set("site_id", siteId);
    return `${href}?${params.toString()}`;
  }

  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  function toggleGroup(group: string) {
    setActiveGroup((prev) => (prev === group ? null : group));
  }

  return (
    <>
      {/* ✅ FORCE SITE SELECTION MODAL */}
      {!hasSite && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[420px] space-y-4">
            <h2 className="text-lg font-semibold">Select a Site</h2>
            <p className="text-sm text-gray-600">
              You must select a site before using the admin panel.
            </p>

            <div className="pt-2">
              <SiteSwitcher />
            </div>

            <p className="text-xs text-gray-500 pt-2">
              This selection will be used across the dashboard.
            </p>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div
        className={`min-h-screen bg-gray-50 text-gray-900 ${
          !hasSite ? "pointer-events-none blur-[1px]" : ""
        }`}
      >
        {/* Sidebar */}
        <aside className="bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 w-[260px]">
          <div className="p-5 border-b border-gray-200 shrink-0">
            <div className="text-xl font-bold text-gray-900">Admin Panel</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Manage your sites
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 shrink-0">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
              Active Site
            </label>
            <SiteSwitcher />
          </div>

          <div className="p-4 border-b border-gray-200 shrink-0">
            <Link
              href={withSite("/content/publish")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              <Save size={16} /> Publish
            </Link>
          </div>

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
                    className={`flex items-center justify-between w-full px-4 py-3 text-sm font-semibold ${
                      isOpen ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    {group}
                    {isOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {isOpen && (
                    <div className="bg-white">
                      {items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);

                        return (
                          <Link
                            key={item.href}
                            href={withSite(item.href)}
                            className={`flex items-center gap-3 px-4 py-2 text-sm ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <item.icon />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex flex-col min-w-0 pl-65">
          <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
        </div>
      </div>
    </>
  );
}
