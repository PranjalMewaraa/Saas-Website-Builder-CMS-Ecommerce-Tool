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
  ChevronDown,
  ChevronRight,
  Save,
  GlobeIcon,
  ChartCandlestick,
  Sparkles,
} from "lucide-react";
import { SiteSwitcher } from "@/app/_components/SiteSwitcher";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  group?: string;
};

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site_id") || "";
  const hasSite = !!siteId;

  const nav: NavItem[] = [
    {
      label: "Dashboard",
      href: "/content",
      icon: LayoutDashboard,
      group: "Core",
    },
    {
      label: "Your Sites",
      href: "/content/sites",
      icon: GlobeIcon,
      group: "Core",
    },
    {
      label: "Site SEO",
      href: "/content/seo",
      icon: ChartCandlestick,
      group: "Core",
    },
    { label: "Pages", href: "/content/pages", icon: FileText, group: "Design" },
    { label: "Menus", href: "/content/menus", icon: Menu, group: "Design" },
    { label: "Theme", href: "/content/theme", icon: Palette, group: "Design" },
    {
      label: "Style Presets",
      href: "/content/presets",
      icon: Brush,
      group: "Design",
    },
    {
      label: "Assets",
      href: "/content/assets",
      icon: ImageIcon,
      group: "Design",
    },
    {
      label: "Forms",
      href: "/content/forms",
      icon: FormInput,
      group: "Interaction",
    },
    {
      label: "Submissions",
      href: "/content/forms/submissions",
      icon: FileText,
      group: "Interaction",
    },
    { label: "Previews", href: "/content/preview", icon: Eye, group: "Core" },
    { label: "My Store", href: "/stores", icon: Store, group: "Commerce" },
    { label: "Brands", href: "/brands", icon: Tags, group: "Commerce" },
    { label: "Categories", href: "/categories", icon: Tags, group: "Commerce" },
    {
      label: "Products",
      href: "/products",
      icon: ShoppingBag,
      group: "Commerce",
    },

    { label: "Orders", href: "/orders", icon: ShoppingBag, group: "Commerce" },
    {
      label: "Inventory",
      href: "/manage/inventory",
      icon: ShoppingBag,
      group: "Commerce",
    },
    {
      label: "Promotions",
      href: "/manage/promotions",
      icon: Tags,
      group: "Commerce",
    },
    {
      label: "Domains",
      href: "/settings/domains",
      icon: Globe,
      group: "System",
    },
    {
      label: "Settings",
      href: "/settings/store",
      icon: Settings,
      group: "System",
    },
    {
      label: "Plugins",
      href: "/settings/plugins",
      icon: Settings,
      group: "System",
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

  const [activeGroup, setActiveGroup] = useState<string | null>("Core");

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* --- FORCED SELECTION MODAL --- */}
      {!hasSite && (
        <div className="fixed inset-0 z-[9999] bg-white/40 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] p-8 w-[440px] text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
              <Sparkles className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Initialize Workspace
              </h2>
              <p className="text-slate-500 mt-2">
                Select a digital asset to begin managing your ecosystem.
              </p>
            </div>
            <div className="p-1 bg-slate-50 rounded-2xl border border-slate-100">
              <SiteSwitcher />
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] z-50 transition-all duration-700 
        ${!hasSite ? "blur-md scale-95 opacity-50 pointer-events-none" : "blur-0 scale-100 opacity-100"}`}
      >
        <div className="h-full m-4 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
          {/* Logo Section */}
          <div className="px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-lg shadow-inner" />
              <span className="font-bold tracking-tighter text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                ADMIN
              </span>
            </div>
          </div>

          {/* Context Switcher */}
          <div className=" mb-4">
            <div className="p-3 bg-white/50 rounded-2xl border border-slate-100/50">
              <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.1em] px-2 mb-1 block">
                Active Environment
              </label>
              <SiteSwitcher />
            </div>
          </div>

          {/* Action Button */}
          <div className="px-4 mb-6">
            <Link
              href={withSite("/content/publish")}
              className="group relative w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white font-medium overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5"
            >
              <Save size={16} className="relative z-10" />
              <span className="relative z-10">Publish Site</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-8 space-y-3 custom-scrollbar">
            {Object.entries(grouped).map(([group, items]) => {
              const isOpen = activeGroup === group;

              return (
                <div key={group} className="space-y-1">
                  <button
                    onClick={() => setActiveGroup(isOpen ? null : group)}
                    className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] hover:text-slate-600 transition-colors"
                  >
                    {group}
                    {isOpen ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>

                  <div
                    className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    {items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={withSite(item.href)}
                          className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
                            ${
                              isActive
                                ? "text-indigo-600 bg-indigo-50/50"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full shadow-[2px_0_8px_rgba(79,70,229,0.4)]" />
                          )}
                          <item.icon
                            size={18}
                            className={`${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main
        className={`transition-all duration-700 pl-[280px] 
        ${!hasSite ? "blur-md" : "blur-0"}`}
      >
        <div className="p-4 max-w-400 mx-auto min-h-screen">
          <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.02)] min-h-[calc(100vh-64px)] ">
            {children}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
