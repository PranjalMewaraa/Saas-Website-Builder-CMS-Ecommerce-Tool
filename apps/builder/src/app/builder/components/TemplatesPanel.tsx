"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Badge, EmptyState, ConfirmDialog } from "@acme/ui";
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
  const [pendingDelete, setPendingDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    const res = await fetch(
      `/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setTemplates(data.templates ?? []);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await fetch(
        `/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}&template_id=${encodeURIComponent(pendingDelete._id)}`,
        { method: "DELETE" }
      );
      await refresh();
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
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
      <Input
        label="Search templates"
        placeholder="Search templates…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.map((t) => (
          <div
            key={t._id}
            className="border border-line rounded-card bg-surface p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium text-sm truncate">{t.name}</div>
              <Badge tone={t.scope === "tenant" ? "accent" : "neutral"}>
                {t.scope === "tenant" ? "Tenant-wide" : "Site"}
              </Badge>
            </div>
            <div className="text-xs text-muted mt-0.5">
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onInsertRequest(t)}
              >
                Insert
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger-soft"
                onClick={() => setPendingDelete(t)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 ? (
          <EmptyState
            title="No templates found"
            description={
              q.trim()
                ? `Nothing matches “${q.trim()}”.`
                : "Save a section as a template to reuse it here."
            }
          />
        ) : null}
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={refresh}
      >
        Refresh
      </Button>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this template?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete template"
        destructive
        loading={deleting}
      />
    </div>
  );
}
