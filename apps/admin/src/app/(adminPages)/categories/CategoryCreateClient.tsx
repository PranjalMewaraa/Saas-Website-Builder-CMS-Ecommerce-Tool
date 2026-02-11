"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
import { useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  attributes?: any[];
};

type DraftAttr = {
  code: string;
  name: string;
  type: string;
  is_required: boolean;
  optionsText: string;
};

type Preset = {
  key: string;
  categories: Array<{
    attributes: Array<{
      code: string;
      name: string;
      type: string;
      required?: boolean;
      options?: string[];
    }>;
  }>;
};

const ATTR_TYPES = [
  "text",
  "textarea",
  "select",
  "multi_select",
  "number",
  "boolean",
  "color",
  "date",
];

function toCode(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function CategoryCreateClient({
  siteId,
  storeId,
  storePreset,
  initialCategories,
  stores,
}: {
  siteId: string;
  storeId: string;
  storePreset: string;
  initialCategories: Category[];
  stores: Array<{ id: string; name: string; store_type: string }>;
}) {
  const { toast } = useUI();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [name, setName] = useState("");
  const [attributes, setAttributes] = useState<DraftAttr[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/v2/store-types?site_id=${encodeURIComponent(siteId)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) setPresets(data.presets || []);
    })();
  }, [siteId]);

  const suggestions = useMemo(() => {
    const preset = presets.find((p) => p.key === storePreset);
    if (!preset) return [];
    const map = new Map<string, DraftAttr>();
    for (const c of preset.categories || []) {
      for (const a of c.attributes || []) {
        if (!map.has(a.code)) {
          map.set(a.code, {
            code: a.code,
            name: a.name,
            type: a.type || "text",
            is_required: Boolean(a.required),
            optionsText: Array.isArray(a.options) ? a.options.join(", ") : "",
          });
        }
      }
    }
    return Array.from(map.values());
  }, [presets, storePreset]);

  async function refresh() {
    const cRes = await fetch(
      `/api/admin/v2/categories?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
      { cache: "no-store" },
    );
    if (!cRes.ok) return;
    const cData = await cRes.json().catch(() => ({}));
    const cats = cData.categories || [];
    const next = await Promise.all(
      cats.map(async (c: any) => {
        const aRes = await fetch(
          `/api/admin/v2/category-attributes?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&category_id=${encodeURIComponent(c.id)}`,
          { cache: "no-store" },
        );
        const aData = await aRes.json().catch(() => ({}));
        return { ...c, attributes: aData.attributes || [] };
      }),
    );
    setCategories(next);
  }

  return (
    <div className="space-y-4">
      <div className="border rounded p-4 bg-white space-y-2">
        <div className="text-sm font-medium">Select Store</div>
        <select
          className="border p-2 rounded w-full"
          value={storeId}
          onChange={(e) => {
            const nextStoreId = e.target.value;
            const params = new URLSearchParams(searchParams.toString());
            params.set("site_id", siteId);
            if (nextStoreId) params.set("store_id", nextStoreId);
            router.replace(`/categories?${params.toString()}`);
          }}
        >
          <option value="">Select a store</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.store_type})
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded p-4 bg-white space-y-3">
        <div className="text-sm font-medium">Create Category</div>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="border p-2 rounded w-full"
          required
        />

        <div className="space-y-2">
          <div className="text-xs text-gray-600">Preset suggestions</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                type="button"
                key={s.code}
                className="px-2 py-1 text-xs border rounded bg-gray-50"
                onClick={() =>
                  setAttributes((prev) => {
                    if (prev.some((x) => x.code === s.code)) return prev;
                    return [...prev, { ...s }];
                  })
                }
              >
                + {s.name}
              </button>
            ))}
          </div>
        </div>

        {attributes.map((a, idx) => (
          <div key={`${a.code}-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <input
              className="border p-2 rounded md:col-span-3"
              placeholder="Name"
              value={a.name}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((x, i) =>
                    i === idx
                      ? { ...x, name: e.target.value, code: x.code || toCode(e.target.value) }
                      : x,
                  ),
                )
              }
            />
            <input
              className="border p-2 rounded md:col-span-2"
              placeholder="Code"
              value={a.code}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, code: toCode(e.target.value) } : x)),
                )
              }
            />
            <select
              className="border p-2 rounded md:col-span-2"
              value={a.type}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, type: e.target.value } : x)),
                )
              }
            >
              {ATTR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="border p-2 rounded md:col-span-3"
              placeholder="Options: S, M, L"
              value={a.optionsText}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, optionsText: e.target.value } : x)),
                )
              }
            />
            <label className="md:col-span-1 text-xs flex items-center gap-1">
              <input
                type="checkbox"
                checked={a.is_required}
                onChange={(e) =>
                  setAttributes((prev) =>
                    prev.map((x, i) =>
                      i === idx ? { ...x, is_required: e.target.checked } : x,
                    ),
                  )
                }
              />
              Req
            </label>
            <button
              type="button"
              className="md:col-span-1 border rounded"
              onClick={() => setAttributes((prev) => prev.filter((_, i) => i !== idx))}
            >
              Remove
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            className="border px-3 py-2 rounded"
            onClick={() =>
              setAttributes((prev) => [
                ...prev,
                {
                  code: "",
                  name: "",
                  type: "text",
                  is_required: false,
                  optionsText: "",
                },
              ])
            }
          >
            + Add Attribute
          </button>
          <button
            className="bg-black text-white px-3 py-2 rounded disabled:opacity-50"
            disabled={loading || !name.trim() || !storeId}
            onClick={async () => {
              setLoading(true);
              const payload = {
                site_id: siteId,
                store_id: storeId,
                name: name.trim(),
                attributes: attributes
                  .filter((a) => a.name.trim())
                  .map((a, idx) => ({
                    code: a.code.trim() || toCode(a.name),
                    name: a.name.trim(),
                    type: a.type,
                    is_required: a.is_required,
                    is_filterable: true,
                    sort_order: idx,
                    options:
                      a.type === "select" || a.type === "multi_select"
                        ? a.optionsText
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean)
                        : [],
                  })),
              };
              const res = await fetch("/api/admin/store-setup/create-category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = await res.json().catch(() => ({}));
              setLoading(false);
              if (!res.ok) {
                toast({
                  variant: "error",
                  title: "Failed",
                  description: data?.error || "Could not create category",
                });
                return;
              }
              setName("");
              setAttributes([]);
              await refresh();
              toast({ variant: "success", title: "Category created" });
            }}
          >
            Add Category
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="border rounded p-3 bg-white">
            <div className="font-medium">{c.name}</div>
            <div className="text-xs opacity-70">slug: {c.slug}</div>
            <div className="text-xs mt-1">
              {(c.attributes || []).length} attributes
            </div>
          </div>
        ))}
        {categories.length === 0 ? (
          <div className="opacity-70 text-sm">No categories yet.</div>
        ) : null}
      </div>
    </div>
  );
}
