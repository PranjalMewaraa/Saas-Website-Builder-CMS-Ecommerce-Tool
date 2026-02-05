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
  MoreHorizontal,
} from "lucide-react";

function normalizeSlug(input: string) {
  let s = (input || "").trim();
  if (!s) return "/";
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  s = s.replace(/\/{2,}/g, "/");
  return s;
}

function slugFromName(input: string) {
  const cleaned = (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalizeSlug(cleaned || "new-page");
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
  {
    key: "product_list",
    label: "Product List",
    desc: "Filterable product catalog page",
  },
  {
    key: "product_detail",
    label: "Product Detail",
    desc: "Dynamic product detail at /products/[slug]",
  },
] as const;

const TEMPLATE_DEFAULT_SLUGS: Record<string, string> = {
  product_list: "/products",
  product_detail: "/products/[slug]",
};

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
  }>({ open: false });

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("New Page");
  const [createSlug, setCreateSlug] = useState("/new-page");
  const [createSlugDirty, setCreateSlugDirty] = useState(false);
  const [createTemplate, setCreateTemplate] =
    useState<(typeof TEMPLATES)[number]["key"]>("blank");
  const [createError, setCreateError] = useState("");

  async function refresh() {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/pages?site_id=${encodeURIComponent(siteId)}`,
          {
            cache: "no-store",
          },
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
        p.slug.toLowerCase().includes(term),
    );
  }, [pages, search]);

  function openCreateDialog() {
    setCreateError("");
    const defaultName = "New Page";
    setCreateName(defaultName);
    setCreateSlug(slugFromName(defaultName));
    setCreateSlugDirty(false);
    setCreateTemplate("blank");
    setCreateOpen(true);
  }

  function requestDelete(page: Page) {
    if (page.slug === "/") return;
    setDeleteModal({ open: true, page });
  }

  async function confirmDelete() {
    if (!deleteModal.page) return;

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/pages?site_id=${encodeURIComponent(siteId)}&page_id=${encodeURIComponent(
            deleteModal.page!._id,
          )}`,
          { method: "DELETE" },
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
          },
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Create failed");
        }

        const data = await res.json();
        setCreateOpen(false);
        await refresh();

        window.location.href = `/content/pages/edit?site_id=${encodeURIComponent(siteId)}&page_id=${encodeURIComponent(
          data.page_id,
        )}`;
      } catch (err: any) {
        setCreateError(err.message || "Could not create page.");
      }
    });
  }

  async function duplicatePage(page: Page) {
    const newName = prompt(
      "New page name",
      `Copy of ${page.name || page.slug}`,
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
          },
        );

        if (!res.ok) throw new Error();
        const data = await res.json();
        await refresh();
        window.location.href = `/content/pages/edit?site_id=${encodeURIComponent(siteId)}&page_id=${encodeURIComponent(
          data.page_id,
        )}`;
      } catch (err) {
        console.error("Duplicate failed", err);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Pages
            </h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Manage all pages for site{" "}
              <strong className="font-semibold text-gray-900">{siteId}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or path..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>

            <button
              onClick={openCreateDialog}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            >
              <Plus size={16} />
              New Page
            </button>
          </div>
        </div>

        {/* Table / Card list */}
        <div className="bg-white rounded-2xl shadow border border-gray-200/70 overflow-hidden">
          <div className="grid grid-cols-[minmax(220px,3fr)_140px_240px] gap-6 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50/80 border-b">
            <div>Page</div>
            <div>Status</div>
            <div className="text-right pr-4">Actions</div>
          </div>

          {isPending ? (
            <div className="py-24 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="py-24 text-center space-y-5">
              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {search ? "No matching pages found" : "No pages yet"}
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {search
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first page."}
              </p>
              {!search && (
                <button
                  onClick={openCreateDialog}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 hover:shadow transition-all"
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
                className="grid grid-cols-[minmax(220px,3fr)_140px_240px] gap-6 px-6 py-4 border-b last:border-b-0 hover:bg-indigo-50/30 transition-colors items-center group"
              >
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {p.name || "Untitled Page"}
                  </div>
                  <div className="text-xs font-mono text-gray-500 mt-0.5 truncate">
                    {p.slug}
                  </div>
                </div>

                <div>
                  {p.slug === "/" ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Home size={13} />
                      Home
                    </span>
                  ) : (
                    <span className="inline-flex px-3.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      Page
                    </span>
                  )}
                </div>

                <div className="flex justify-end items-center gap-2.5 opacity-75 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/content/pages/edit?site_id=${encodeURIComponent(siteId)}&page_id=${encodeURIComponent(p._id)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>

                  <button
                    onClick={() => duplicatePage(p)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all disabled:opacity-50"
                  >
                    <Copy size={14} />
                    Duplicate
                  </button>

                  <button
                    onClick={() => requestDelete(p)}
                    disabled={isPending || p.slug === "/"}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
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

      {/* ────────────────────────────────────────────────
          Create Modal – more modern / shadcn-like
      ──────────────────────────────────────────────── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200/70 overflow-hidden transform transition-all scale-100">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                  Create New Page
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Set name, path and choose a starting template
                </p>
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Page Name
                </label>
                <input
                  autoFocus
                  value={createName}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCreateName(next);
                    if (!createSlugDirty) {
                      setCreateSlug(slugFromName(next));
                    }
                  }}
                  placeholder="e.g. Services, Pricing, Blog"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Slug / URL path
                </label>
                <input
                  value={createSlug}
                  onChange={(e) => {
                    setCreateSlugDirty(true);
                    setCreateSlug(e.target.value);
                  }}
                  onBlur={() => setCreateSlug(normalizeSlug(createSlug))}
                  placeholder="/services"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-mono bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
                <p className="text-xs text-gray-500">
                  Must start with / • no spaces, ?, #
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Starting Template
                </label>
                <select
                  value={createTemplate}
                  onChange={(e) => {
                    const next = e.target.value as any;
                    setCreateTemplate(next);
                    if (!createSlugDirty && TEMPLATE_DEFAULT_SLUGS[next]) {
                      setCreateSlug(TEMPLATE_DEFAULT_SLUGS[next]);
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 italic">
                  {TEMPLATES.find((t) => t.key === createTemplate)?.desc}
                </p>
              </div>

              {createError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3.5">
                  {createError}
                </div>
              )}
            </div>

            <div className="px-6 py-5 border-t bg-gray-50/70 flex justify-end gap-3">
              <button
                onClick={() => setCreateOpen(false)}
                className="px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={submitCreate}
                disabled={isPending}
                className="min-w-[140px] px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/70 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Delete Page?
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    <strong className="font-medium">
                      {deleteModal.page?.slug ?? "—"}
                    </strong>{" "}
                    will be moved to trash.
                    <br />
                    You can restore it later from the trash section.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t bg-gray-50/70 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false })}
                className="px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="min-w-[140px] px-6 py-2.5 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
