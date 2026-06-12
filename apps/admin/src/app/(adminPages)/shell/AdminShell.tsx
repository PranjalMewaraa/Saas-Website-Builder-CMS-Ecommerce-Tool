"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Menu,
  Palette,
  Brush,
  Image as ImageIcon,
  FormInput,
  Eye,
  Store,
  Tags,
  ShoppingBag,
  Globe,
  Settings,
  X,
} from "lucide-react";
import { buttonClass, cn } from "@acme/ui";
import { SiteSwitcher } from "@/app/_components/SiteSwitcher";
import { LogoutButton } from "./Logout";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  group: string;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/content", icon: LayoutDashboard, group: "Overview" },
  { label: "Your sites", href: "/content/sites", icon: Globe, group: "Overview" },
  { label: "SEO", href: "/content/seo", icon: Eye, group: "Overview" },
  { label: "Previews", href: "/content/preview", icon: Eye, group: "Overview" },
  { label: "Pages", href: "/content/pages", icon: FileText, group: "Design" },
  { label: "Menus", href: "/content/menus", icon: Menu, group: "Design" },
  { label: "Theme", href: "/content/theme", icon: Palette, group: "Design" },
  { label: "Style presets", href: "/content/presets", icon: Brush, group: "Design" },
  { label: "Assets", href: "/content/assets", icon: ImageIcon, group: "Design" },
  { label: "Forms", href: "/content/forms", icon: FormInput, group: "Forms" },
  { label: "Submissions", href: "/content/forms/submissions", icon: FileText, group: "Forms" },
  { label: "My store", href: "/stores", icon: Store, group: "Commerce" },
  { label: "Products", href: "/products", icon: ShoppingBag, group: "Commerce" },
  { label: "Orders", href: "/orders", icon: ShoppingBag, group: "Commerce" },
  { label: "Brands", href: "/brands", icon: Tags, group: "Commerce" },
  { label: "Categories", href: "/categories", icon: Tags, group: "Commerce" },
  { label: "Inventory", href: "/manage/inventory", icon: ShoppingBag, group: "Commerce" },
  { label: "Promotions", href: "/manage/promotions", icon: Tags, group: "Commerce" },
  { label: "Domains", href: "/settings/domains", icon: Globe, group: "Settings" },
  { label: "Store settings", href: "/settings/store", icon: Settings, group: "Settings" },
  { label: "Plugins", href: "/settings/plugins", icon: Settings, group: "Settings" },
];

export default function AdminShell({
  children,
  siteId: siteIdProp = "",
}: {
  children: React.ReactNode;
  siteId?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSiteId = searchParams.get("site_id") || siteIdProp;
  const [mobileOpen, setMobileOpen] = useState(false);

  const grouped = useMemo(() => {
    const order: string[] = [];
    const map: Record<string, NavItem[]> = {};
    for (const item of NAV) {
      if (!map[item.group]) {
        map[item.group] = [];
        order.push(item.group);
      }
      map[item.group].push(item);
    }
    return order.map((g) => [g, map[g]] as const);
  }, []);

  function withSite(href: string) {
    if (!activeSiteId) return href;
    const params = new URLSearchParams();
    params.set("site_id", activeSiteId);
    return `${href}?${params.toString()}`;
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface",
          "transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-line px-4">
          <Link
            href={withSite("/content")}
            className="font-display text-lg font-semibold text-ink"
          >
            Admin
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="rounded-control p-1 text-muted hover:bg-canvas lg:hidden"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Main"
          className="flex-1 overflow-y-auto px-3 py-4 space-y-6"
        >
          {grouped.map(([group, items]) => (
            <div key={group} className="space-y-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {group}
              </p>
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={withSite(item.href)}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-muted hover:bg-canvas hover:text-ink",
                    )}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent"
                        aria-hidden="true"
                      />
                    )}
                    <item.icon size={18} aria-hidden="true" className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <LogoutButton />
        </div>
      </aside>

      {/* Content column */}
      <div className="lg:pl-64">
        {/* Publish bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-controls="admin-sidebar"
            aria-expanded={mobileOpen}
            className="rounded-control p-2 text-muted hover:bg-canvas lg:hidden"
          >
            <Menu size={18} aria-hidden="true" />
          </button>

          <div className="w-full max-w-xs">
            <SiteSwitcher activeSiteId={siteIdProp} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={withSite("/content/preview")}
              className={buttonClass({ variant: "secondary", size: "sm" })}
            >
              <Eye size={16} aria-hidden="true" />
              Preview
            </Link>
            <Link
              href={withSite("/content/publish")}
              className={buttonClass({ variant: "accent", size: "sm" })}
            >
              Publish
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
