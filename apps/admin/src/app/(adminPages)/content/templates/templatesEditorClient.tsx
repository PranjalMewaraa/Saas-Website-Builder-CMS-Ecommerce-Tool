"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
import { Save, Trash2, Search, Layout, Blocks } from "lucide-react";
import { useAssetsMap } from "../_component/useAssetsMap";
import SectionTemplatePreview from "../../builder/components/SectionTemplatePreview";
import { computeFinalStyle } from "@acme/renderer/style-merge";
import { resolveWrapperStyle } from "@acme/renderer/style-resolver";

function normalize(s: string) {
  return (s || "").toLowerCase().trim();
}

type Tab = "sections" | "blocks";

export default function TemplatesEditorClient({ siteId }: { siteId: string }) {
  const { confirm, toast } = useUI();
  const [tab, setTab] = useState<Tab>("sections");
  const [search, setSearch] = useState("");
  const [sectionTemplates, setSectionTemplates] = useState<any[]>([]);
  const [blockTemplates, setBlockTemplates] = useState<any[]>([]);
  const [stylePresets, setStylePresets] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [loading, setLoading] = useState(true);

  const { assetsMap } = useAssetsMap(siteId);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [sectionsRes, blocksRes, presetsRes] = await Promise.all([
        fetch(`/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}`, {
          cache: "no-store",
        }),
        fetch(`/api/admin/block-templates?site_id=${encodeURIComponent(siteId)}`, {
          cache: "no-store",
        }),
        fetch(`/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`, {
          cache: "no-store",
        }),
      ]);

      const [sectionsData, blocksData, presetsData] = await Promise.all([
        sectionsRes.json(),
        blocksRes.json(),
        presetsRes.json(),
      ]);

      const sections = sectionsData.templates ?? [];
      const blocks = blocksData.templates ?? [];
      setSectionTemplates(sections);
      setBlockTemplates(blocks);
      setStylePresets(presetsData.presets ?? []);

      if (!selectedSectionId && sections.length) {
        setSelectedSectionId(sections[0]._id);
      }
      if (!selectedBlockId && blocks.length) {
        setSelectedBlockId(blocks[0]._id);
      }

      setLoading(false);
    })();
  }, [siteId]);

  const filteredSections = useMemo(() => {
    const term = normalize(search);
    if (!term) return sectionTemplates;
    return sectionTemplates.filter((t) => {
      const name = normalize(t.name);
      const tags = normalize((t.tags || []).join(" "));
      return name.includes(term) || tags.includes(term);
    });
  }, [sectionTemplates, search]);

  const filteredBlocks = useMemo(() => {
    const term = normalize(search);
    if (!term) return blockTemplates;
    return blockTemplates.filter((t) => {
      const name = normalize(t.name);
      const type = normalize(t.block?.type || "");
      const tags = normalize((t.tags || []).join(" "));
      return name.includes(term) || type.includes(term) || tags.includes(term);
    });
  }, [blockTemplates, search]);

  const selectedSection = useMemo(
    () => sectionTemplates.find((t) => t._id === selectedSectionId),
    [sectionTemplates, selectedSectionId],
  );

  const selectedBlock = useMemo(
    () => blockTemplates.find((t) => t._id === selectedBlockId),
    [blockTemplates, selectedBlockId],
  );

  useEffect(() => {
    const tpl = tab === "sections" ? selectedSection : selectedBlock;
    if (!tpl) return;
    setEditName(tpl.name || "");
    setEditCategory(tpl.category || "");
    setEditTags((tpl.tags || []).join(", "));
  }, [tab, selectedSection, selectedBlock]);

  const snapshotLike = useMemo(
    () => ({ assets: assetsMap, stylePresets }),
    [assetsMap, stylePresets],
  );

  async function saveMeta() {
    const tags = editTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (tab === "sections" && selectedSection) {
      await fetch(`/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            template_id: selectedSection._id,
            name: editName,
            category: editCategory,
            tags,
          }),
        }
      );

      const res = await fetch(`/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setSectionTemplates(data.templates ?? []);
      return;
    }

    if (tab === "blocks" && selectedBlock) {
      await fetch(`/api/admin/block-templates?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            template_id: selectedBlock._id,
            name: editName,
            category: editCategory,
            tags,
          }),
        }
      );

      const res = await fetch(`/api/admin/block-templates?site_id=${encodeURIComponent(siteId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setBlockTemplates(data.templates ?? []);
    }
  }

  async function deleteTemplate() {
    if (tab === "sections" && selectedSection) {
      const ok = await confirm({
        title: "Delete section template?",
        confirmText: "Delete",
        tone: "danger",
      });
      if (!ok) return;
      await fetch(
        `/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}&template_id=${encodeURIComponent(selectedSection._id)}`,
        { method: "DELETE" },
      );
      const res = await fetch(`/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setSectionTemplates(data.templates ?? []);
      setSelectedSectionId(data.templates?.[0]?._id || "");
      return;
    }

    if (tab === "blocks" && selectedBlock) {
      const ok = await confirm({
        title: "Delete block template?",
        confirmText: "Delete",
        tone: "danger",
      });
      if (!ok) return;
      await fetch(
        `/api/admin/block-templates?site_id=${encodeURIComponent(siteId)}&template_id=${encodeURIComponent(selectedBlock._id)}`,
        { method: "DELETE" },
      );
      const res = await fetch(`/api/admin/block-templates?site_id=${encodeURIComponent(siteId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setBlockTemplates(data.templates ?? []);
      setSelectedBlockId(data.templates?.[0]?._id || "");
    }
  }

  const listItems = tab === "sections" ? filteredSections : filteredBlocks;
  const selected = tab === "sections" ? selectedSection : selectedBlock;
  const allCategories = useMemo(() => {
    const list = tab === "sections" ? sectionTemplates : blockTemplates;
    const cats = new Set<string>();
    for (const t of list) {
      const c = String(t?.category || "").trim();
      if (c) cats.add(c);
    }
    return Array.from(cats).sort();
  }, [tab, sectionTemplates, blockTemplates]);

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    const items = listItems || [];
    for (const t of items) {
      const cat = String(t?.category || "").trim() || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  }, [listItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden h-fit">
        <div className="p-4 border-b bg-muted/40 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("sections")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === "sections"
                  ? "bg-black text-white"
                  : "bg-white border text-gray-700"
              }`}
            >
              <Layout className="h-4 w-4 inline-block mr-1" />
              Sections
            </button>
            <button
              onClick={() => setTab("blocks")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === "blocks"
                  ? "bg-black text-white"
                  : "bg-white border text-gray-700"
              }`}
            >
              <Blocks className="h-4 w-4 inline-block mr-1" />
              Blocks
            </button>
          </div>

          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-4 px-3 pb-3 max-h-[70vh] overflow-y-auto">
          {listItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No templates found
            </div>
          ) : (
            grouped.map(([cat, items]) => (
              <div key={cat} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 px-1">
                  {cat}
                </div>
                <div className="space-y-2">
                  {items.map((t) => {
                    const active =
                      t._id ===
                      (tab === "sections" ? selectedSectionId : selectedBlockId);
                    const label = t.name || "Untitled";
                    const subtitle =
                      tab === "sections"
                        ? `${t.section?.blocks?.length || 0} blocks`
                        : t.block?.type || "Block";
                    return (
                      <button
                        key={t._id}
                        onClick={() =>
                          tab === "sections"
                            ? setSelectedSectionId(t._id)
                            : setSelectedBlockId(t._id)
                        }
                        className={`w-full text-left rounded-lg text-sm transition-colors border ${
                          active
                            ? "bg-primary/10 border-primary/40"
                            : "hover:bg-muted border-transparent"
                        }`}
                      >
                        <div className="p-3">
                          <div className="font-medium truncate">{label}</div>
                          <div className="text-xs opacity-70 truncate">
                            {subtitle}
                          </div>
                          <div className="mt-2">
                            {tab === "sections" ? (
                              <div className="rounded-md border overflow-hidden">
                                <SectionTemplatePreview
                                  template={t}
                                  snapshotLike={snapshotLike}
                                />
                              </div>
                            ) : (
                              <div className="rounded-md border overflow-hidden">
                                <BlockTemplatePreview
                                  template={t}
                                  snapshotLike={snapshotLike}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-6">
        {!selected ? (
          <div className="border rounded-xl p-6 text-sm text-muted-foreground">
            Select a template to view details.
          </div>
        ) : (
          <div className="border rounded-xl p-6 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500">Template Details</div>
                <div className="text-xl font-semibold">
                  {selected.name || "Untitled"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Scope: {selected.scope === "tenant" ? "Tenant-wide" : "Site"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={saveMeta}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={deleteTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  list="template-category-options"
                  placeholder="e.g. Marketing"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <datalist id="template-category-options">
                  {allCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="hero, pricing, footer"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {tab === "sections" ? (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-700">
                  Section Preview
                </div>
                <SectionTemplatePreview
                  template={selected}
                  snapshotLike={snapshotLike}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-700">
                  Block Preview
                </div>
                <BlockTemplatePreview
                  template={selected}
                  snapshotLike={snapshotLike}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BlockTemplatePreview({
  template,
  snapshotLike,
}: {
  template: any;
  snapshotLike: any;
}) {
  const block = template.block || {};

  const finalStyle = computeFinalStyle({
    style: block.style,
    presets: snapshotLike.stylePresets,
    assets: snapshotLike.assets,
  });

  const { outerClass, innerClass, outerStyle, innerStyle } =
    resolveWrapperStyle(finalStyle);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={outerClass} style={outerStyle}>
        <div className={`${innerClass} __inner`} style={innerStyle}>
          <div className="p-4">
            <div className="text-xs font-semibold">{block.type}</div>
            <div className="text-[11px] opacity-60">{block.id}</div>
            <div className="mt-3 h-12 rounded border border-dashed border-black/20 bg-white/40 flex items-center justify-center text-[10px] opacity-70">
              Style preview
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
