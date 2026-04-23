"use client";

import { useEffect, useMemo, useState } from "react";
import SectionTemplatePreview from "./SectionTemplatePreview";

function normalize(s: string) {
  return (s || "").toLowerCase().trim();
}

export default function TemplatesPanel({
  siteId,
  onInsertRequest,
  snapshotLike,
}: {
  siteId: string;
  onInsertRequest: (template: any) => void;
  snapshotLike: any;
}) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [q, setQ] = useState("");

  async function refresh() {
    const res = await fetch(
      `/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setTemplates(data.templates ?? []);
  }

  useEffect(() => {
    refresh();
  }, [siteId]);

  const filtered = useMemo(() => {
    const s = normalize(q);
    if (!s) return templates;
    return templates.filter((t) => {
      const name = normalize(t.name);
      const tags = normalize((t.tags || []).join(" "));
      return name.includes(s) || tags.includes(s);
    });
  }, [templates, q]);

  return (
    <div className="space-y-3">
      <div className="font-semibold">Section Templates</div>
      <input
        className="border rounded p-2 w-full"
        placeholder="Search templates…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.map((t) => (
          <div key={t._id} className="border rounded p-2">
            <div className="font-medium text-sm">{t.name}</div>
            <div className="text-xs opacity-70">
              <span className="inline-flex items-center px-2 py-0.5 rounded border mr-2">
                {t.scope === "tenant" ? "Tenant-wide" : "Site"}
              </span>
              {t.section?.blocks?.length || 0} blocks
              {t.tags?.length ? ` · ${t.tags.join(", ")}` : ""}
            </div>
            <div className="mt-2">
              <SectionTemplatePreview
                template={t}
                snapshotLike={snapshotLike}
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                className="border rounded px-2 py-1 text-xs"
                type="button"
                onClick={() => onInsertRequest(t)}
              >
                Insert
              </button>

              <button
                className="border rounded px-2 py-1 text-xs"
                type="button"
                onClick={async () => {
                  const ok = confirm("Delete this template?");
                  if (!ok) return;
                  await fetch(
                    `/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}&template_id=${encodeURIComponent(t._id)}`,
                    { method: "DELETE" }
                  );
                  await refresh();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="text-sm opacity-70 border rounded p-3">
            No templates found.
          </div>
        ) : null}
      </div>

      <button
        className="border rounded px-3 py-2 text-sm w-full"
        type="button"
        onClick={refresh}
      >
        Refresh
      </button>
    </div>
  );
}
