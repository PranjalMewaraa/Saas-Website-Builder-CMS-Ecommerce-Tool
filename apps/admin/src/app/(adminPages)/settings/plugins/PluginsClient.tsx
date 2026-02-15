"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
type ModuleKey =
  | "catalog"
  | "builder"
  | "themes"
  | "menus"
  | "forms"
  | "assets"
  | "custom_entities"
  | "checkout"
  | "promotions";
import {
  ShoppingBag,
  LayoutDashboard,
  Palette,
  Menu,
  FormInput,
  Image,
  Code2,
  CreditCard,
  BadgePercent,
} from "lucide-react";
import { useUI } from "@/app/_components/ui/UiProvider";

type SiteDoc = {
  _id: string;
  modules_enabled?: Record<string, boolean>;
};

export default function PluginsClient() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site_id") || "";
  const { toast } = useUI();

  const [site, setSite] = useState<SiteDoc | null>(null);
  const [savingKey, setSavingKey] = useState<ModuleKey | null>(null);

  const modules = useMemo(
    () =>
      [
        {
          key: "catalog",
          label: "Catalog",
          defaultEnabled: true,
          dependencies: [],
          conflicts: [],
        },
        {
          key: "builder",
          label: "Page Builder",
          defaultEnabled: true,
          dependencies: [],
          conflicts: [],
        },
        {
          key: "themes",
          label: "Themes",
          defaultEnabled: true,
          dependencies: ["builder"],
          conflicts: [],
        },
        {
          key: "menus",
          label: "Menus",
          defaultEnabled: true,
          dependencies: ["builder"],
          conflicts: [],
        },
        {
          key: "forms",
          label: "Forms",
          defaultEnabled: true,
          dependencies: ["builder"],
          conflicts: [],
        },
        {
          key: "assets",
          label: "Assets",
          defaultEnabled: true,
          dependencies: ["builder"],
          conflicts: [],
        },
        {
          key: "custom_entities",
          label: "Custom Entities",
          defaultEnabled: true,
          dependencies: ["builder"],
          conflicts: [],
        },
        {
          key: "checkout",
          label: "Checkout",
          defaultEnabled: false,
          dependencies: ["catalog"],
          conflicts: [],
        },
        {
          key: "promotions",
          label: "Promotions",
          defaultEnabled: false,
          dependencies: ["checkout", "catalog"],
          conflicts: [],
        },
      ] as const,
    [],
  );

  async function loadSite() {
    if (!siteId) return;
    const res = await fetch(`/api/admin/sites?site_id=${siteId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    setSite(data.site || null);
  }

  useEffect(() => {
    loadSite();
  }, [siteId]);

  async function toggleModule(key: ModuleKey, enabled: boolean) {
    if (!siteId) return;
    setSavingKey(key);
    try {
      const res = await fetch(`/api/admin/sites/modules?site_id=${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "error",
          title: "Plugin update failed",
          description: data?.error || "Unable to update plugin state",
        });
        return;
      }
      setSite(data.site);
      toast({
        variant: "success",
        title: "Plugin updated",
        description: `${modules.find((m) => m.key === key)?.label || key} is now ${
          data.site?.modules_enabled?.[key] ? "enabled" : "disabled"
        }.`,
      });
    } finally {
      setSavingKey(null);
    }
  }

  const enabledMap = site?.modules_enabled || {};

  const meta: Record<
    ModuleKey,
    { icon: React.ComponentType<{ className?: string }>; desc: string }
  > = {
    catalog: {
      icon: ShoppingBag,
      desc: "Products, categories, brands, and catalog browsing.",
    },
    builder: {
      icon: LayoutDashboard,
      desc: "Visual page builder and block rendering.",
    },
    themes: {
      icon: Palette,
      desc: "Theme tokens, typography, and brand styling.",
    },
    menus: {
      icon: Menu,
      desc: "Site navigation menus and header/footer links.",
    },
    forms: {
      icon: FormInput,
      desc: "Form builder, embeds, and submissions.",
    },
    assets: {
      icon: Image,
      desc: "Asset uploads, media management, and image usage.",
    },
    custom_entities: {
      icon: Code2,
      desc: "Custom data types and structured content.",
    },
    checkout: {
      icon: CreditCard,
      desc: "Cart, checkout, and order flows.",
    },
    promotions: {
      icon: BadgePercent,
      desc: "Discounts, coupons, and promotions.",
    },
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Plugin Manager</h1>
        <div className="text-sm opacity-70">
          Manage optional plugins for this site. Core plugins are fixed and
          cannot be disabled.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {modules.map((m) => {
          const isEnabled = enabledMap[m.key] === true;
          const isCore = m.defaultEnabled === true;
          const isLocked = isCore;
          return (
            <div
              key={m.key}
              className="border rounded-xl bg-white p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {(() => {
                      const Icon = meta[m.key]?.icon || Code2;
                      return <Icon className="h-5 w-5 text-gray-600" />;
                    })()}
                  </div>
                  <div>
                    <div className="font-semibold">{m.label}</div>
                    <div className="text-xs opacity-70">{m.key}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {meta[m.key]?.desc || "Plugin"}
                    </div>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    disabled={isLocked || savingKey === m.key}
                    onChange={(e) => toggleModule(m.key, e.target.checked)}
                  />
                  {isEnabled ? "On" : "Off"}
                </label>
              </div>

              <div className="text-xs opacity-70">
                {isCore ? "Core plugin (locked)" : "Optional plugin"}
              </div>

              {m.dependencies?.length ? (
                <div className="text-xs">
                  <span className="opacity-70">Requires:</span>{" "}
                  {m.dependencies.join(", ")}
                </div>
              ) : null}

              {m.conflicts?.length ? (
                <div className="text-xs">
                  <span className="opacity-70">Conflicts:</span>{" "}
                  {m.conflicts.join(", ")}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
