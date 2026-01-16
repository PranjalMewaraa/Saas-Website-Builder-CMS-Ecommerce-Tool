"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Plus,
  Search,
  Copy,
  Trash2,
  Pencil,
  Home,
  AlertTriangle,
  X,
  FileText,
} from "lucide-react";

function normalizeSlug(input: string) {
  let s = (input || "").trim();
  if (!s) return "/";
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  s = s.replace(/\/{2,}/g, "/");
  return s;
}

function isValidSlug(slug: string) {
  if (!slug.startsWith("/")) return false;
  if (slug.includes(" ") || slug.includes("?") || slug.includes("#"))
    return false;
  return true;
}

const TEMPLATES = [
  { key: "blank", label: "Blank", desc: "Start from scratch" },
  {
    key: "landing",
    label: "Landing Page",
    desc: "Hero + features + CTA + footer",
  },
  { key: "about", label: "About", desc: "Classic about page layout" },
  { key: "contact", label: "Contact", desc: "Hero + simple contact form" },
] as const;

type Page = {
  _id: string;
  name?: string;
  slug: string;
};

interface Props {
  siteId: string;
}

export default function PagesClient({ siteId }: Props) {
  const [pages, setPages] = useState<Page[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    page?: Page;
  }>({
    open: false,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("New Page");
  const [createSlug, setCreateSlug] = useState("/new-page");
  const [createTemplate, setCreateTemplate] =
    useState<(typeof TEMPLATES)[number]["key"]>("blank");
  const [createError, setCreateError] = useState("");

  async function refresh() {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/pages?site_id=${encodeURIComponent(siteId)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to fetch pages");
        const data = await res.json();
        setPages(data.pages ?? []);
      } catch (err) {
        console.error(err);
      }
    });
  }

  useEffect(() => {
    refresh();
  }, [siteId]);

  const filteredPages = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pages;
    return pages.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term)
    );
  }, [pages, search]);

  function openCreateDialog() {
    setCreateError("");
    setCreateName("New Page");
    setCreateSlug("/new-page");
    setCreateTemplate("blank");
    setCreateOpen(true);
  }

  function requestDelete(page: Page) {
    if (page.slug === "/") return;
    setDeleteModal({ open: true, page });
  }

  async function confirmDelete() {
    // Guard against undefined page → fixes TS warning
    if (!deleteModal.page) return;

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/pages?site_id=${encodeURIComponent(siteId)}&page_id=${encodeURIComponent(
            deleteModal.page._id
          )}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error();
        setDeleteModal({ open: false });
        await refresh();
      } catch (err) {
        console.error("Delete failed", err);
      }
    });
  }

  async function submitCreate() {
    setCreateError("");
    const name = createName.trim();
    const slug = normalizeSlug(createSlug);

    if (!name) return setCreateError("Page name is required.");
    if (!isValidSlug(slug))
      return setCreateError("Invalid slug. Example: /about, /blog/post-1");
    if (pages.some((p) => p.slug.toLowerCase() === slug.toLowerCase())) {
      return setCreateError("A page with this slug already exists.");
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/pages?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "create",
              name,
              slug,
              template: createTemplate,
            }),
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Create failed");
        }

        const data = await res.json();
        setCreateOpen(false);
        await refresh();

        window.location.href = `/content/pages/edit?site_id=${encodeURIComponent(
          siteId
        )}&page_id=${encodeURIComponent(data.page_id)}`;
      } catch (err: any) {
        setCreateError(err.message || "Could not create page.");
      }
    });
  }

  async function duplicatePage(page: Page) {
    const newName = prompt(
      "New page name",
      `Copy of ${page.name || page.slug}`
    );
    if (!newName?.trim()) return;

    const suggested = page.slug === "/" ? "/home-copy" : `${page.slug}-copy`;
    const newSlugRaw = prompt("New slug", suggested);
    const newSlug = normalizeSlug(newSlugRaw || suggested);

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/pages?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "duplicate",
              source_page_id: page._id,
              name: newName.trim(),
              slug: newSlug,
            }),
          }
        );

        if (!res.ok) throw new Error();
        const data = await res.json();
        await refresh();
        window.location.href = `/content/pages/edit?site_id=${encodeURIComponent(
          siteId
        )}&page_id=${encodeURIComponent(data.page_id)}`;
      } catch (err) {
        console.error("Duplicate failed", err);
      }
    });
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
            <p className="mt-1.5 text-gray-600">
              Site:{" "}
              <strong className="font-medium text-gray-900">{siteId}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pages..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>

            <button
              onClick={openCreateDialog}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-60"
            >
              <Plus size={16} />
              New Page
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="grid grid-cols-[minmax(200px,3fr)_140px_220px] gap-6 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 border-b">
            <div>Page</div>
            <div>Status</div>
            <div className="text-right pr-2">Actions</div>
          </div>

          {isPending ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {search ? "No matching pages" : "No pages yet"}
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {search
                  ? "Try different keywords"
                  : "Create your first page to begin."}
              </p>
              {!search && (
                <button
                  onClick={openCreateDialog}
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Create Page
                </button>
              )}
            </div>
          ) : (
            filteredPages.map((p) => (
              <div
                key={p._id}
                className="grid grid-cols-[minmax(200px,3fr)_140px_220px] gap-6 px-6 py-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors items-center group"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate text-gray-900">
                    {p.name || "Untitled"}
                  </div>
                  <div className="text-xs font-mono text-gray-500 mt-0.5 truncate">
                    {p.slug}
                  </div>
                </div>

                <div>
                  {p.slug === "/" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <Home size={13} />
                      Home
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      Page
                    </span>
                  )}
                </div>

                <div className="flex justify-end items-center gap-2.5 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/content/pages/edit?site_id=${encodeURIComponent(siteId)}&page_id=${encodeURIComponent(p._id)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>

                  <button
                    onClick={() => duplicatePage(p)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    <Copy size={14} />
                    Duplicate
                  </button>

                  <button
                    onClick={() => requestDelete(p)}
                    disabled={isPending || p.slug === "/"}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Create New Page
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose name, path and optional template
                </p>
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium block text-gray-700">
                  Page Name
                </label>
                <input
                  autoFocus
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Services, Blog, Pricing"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block text-gray-700">
                  Slug / URL path
                </label>
                <input
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  onBlur={() => setCreateSlug(normalizeSlug(createSlug))}
                  placeholder="/services"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">
                  Must start with / • no spaces, ?, #
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block text-gray-700">
                  Template
                </label>
                <select
                  value={createTemplate}
                  onChange={(e) => setCreateTemplate(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {TEMPLATES.find((t) => t.key === createTemplate)?.desc}
                </p>
              </div>

              {createError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {createError}
                </div>
              )}
            </div>

            <div className="px-6 py-5 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setCreateOpen(false)}
                className="px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={submitCreate}
                disabled={isPending}
                className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all disabled:opacity-60 min-w-[120px] flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating…
                  </>
                ) : (
                  "Create Page"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Delete this page?</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    <strong>{deleteModal.page?.slug ?? "—"}</strong> will be
                    moved to trash.
                    <br />
                    You can restore it later.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setDeleteModal({ open: false })}
                className="px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="px-6 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-all disabled:opacity-60 min-w-[120px] flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Deleting…
                  </>
                ) : (
                  "Delete Page"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
