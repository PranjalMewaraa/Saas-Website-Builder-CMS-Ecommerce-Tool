"use client";
import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { useUI } from "@/app/_components/ui/UiProvider";

/**
 * Shared inspector primitives used by the block-prop editors. Extracted from
 * BlocksPropForm.tsx so every per-block editor (and the home/studio editors,
 * once consolidated) can import one copy instead of redefining them.
 */

export const ICON_OPTIONS = [
  "ShoppingBag",
  "ShoppingCart",
  "Tag",
  "Gift",
  "Sparkles",
  "Star",
  "Palette",
  "BadgePercent",
  "Award",
  "CreditCard",
  "Truck",
  "Package",
  "Heart",
  "ThumbsUp",
  "ArrowRight",
  "ArrowUpRight",
  "ChevronRight",
  "Link",
  "Mail",
  "Phone",
  "MessageCircle",
  "RotateCcw",
  "Info",
  "HelpCircle",
  "Shield",
  "Lock",
  "User",
  "Users",
  "Globe",
  "MapPin",
  "Clock",
  "Calendar",
  "Camera",
  "Play",
  "Video",
  "Image",
  "Search",
  "Filter",
  "Plus",
  "Minus",
  "Check",
  "X",
];

export function IconPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const items = ICON_OPTIONS.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  const Current = value ? (LucideIcons as any)[value] : null;

  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <button
        type="button"
        className="w-full border rounded-lg px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {Current ? <Current className="h-4 w-4" /> : null}
          <span className="text-sm text-gray-700">{value || "None"}</span>
        </div>
        <span className="text-xs text-gray-500">{open ? "Close" : "Pick"}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Pick an icon</div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <input
              className="mt-3 w-full border rounded-md px-2 py-1.5 text-sm"
              placeholder="Search icons"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-3 max-h-64 overflow-auto grid grid-cols-6 gap-2">
              <button
                type="button"
                className="border rounded-md px-2 py-2 text-xs text-gray-500 hover:bg-gray-50"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                title="None"
              >
                None
              </button>
              {items.map((name) => {
                const Icon = (LucideIcons as any)[name];
                if (!Icon) return null;
                return (
                  <button
                    key={name}
                    type="button"
                    className="border rounded-md px-2 py-2 text-xs hover:bg-gray-50 flex items-center justify-center"
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    title={name}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SocialLinksEditor({
  value,
  onChange,
}: {
  value?: string[];
  onChange: (next: string[]) => void;
}) {
  const links = Array.isArray(value) ? value : [];
  return (
    <div className="space-y-2">
      {links.map((link, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="https://x.com/yourhandle"
            value={link}
            onChange={(e) => {
              const next = [...links];
              next[idx] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="text-xs text-red-600 hover:text-red-700 border border-red-200 px-2 py-1 rounded"
            onClick={() => {
              const next = links.filter((_, i) => i !== idx);
              onChange(next);
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-xs border rounded px-2 py-1 hover:bg-muted"
        onClick={() => onChange([...links, ""])}
      >
        Add social URL
      </button>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
        {label}
      </label>
      <input
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm
                   transition-all duration-200 placeholder:text-slate-400
                   hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
        {label}
      </label>
      <input
        type="number"
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm
                   transition-all duration-200
                   hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none
                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        value={Number.isNaN(value) ? 0 : value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<string | { label: string; value: string }>;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      <label className="text-sm font-semibold text-slate-700 ml-0.5">
        {label}
      </label>
      <div className="relative group min-w-0">
        <select
          className="w-full min-w-0 appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm
                     transition-all duration-200 outline-none
                     hover:border-slate-400
                     focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => {
            const optLabel = typeof o === "string" ? o : o.label;
            const optValue = typeof o === "string" ? o : o.value;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
        {/* Custom Chevron for a more premium feel */}
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
          <ChevronDown size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

export function RichTextEditor({
  value,
  mode,
  onModeChange,
  onChange,
}: {
  value: string;
  mode: "visual" | "html";
  onModeChange: (m: "visual" | "html") => void;
  onChange: (html: string) => void;
}) {
  const { prompt } = useUI();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing your policy...",
      }),
      Typography,
    ],
    content: value || "<p></p>",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== (value || "")) {
      editor.commands.setContent(value || "<p></p>");
    }
  }, [value, editor]);

  function insertPreset(kind: "title" | "subtitle" | "para") {
    if (!editor) return;
    const text =
      kind === "title"
        ? "Your Title"
        : kind === "subtitle"
          ? "Your subtitle goes here"
          : "Your paragraph text goes here.";
    const styles =
      kind === "title"
        ? "font-size:28px;font-weight:700;line-height:1.2;margin:0 0 12px;"
        : kind === "subtitle"
          ? "font-size:18px;font-weight:500;line-height:1.5;margin:0 0 10px;opacity:0.85;"
          : "font-size:14px;font-weight:400;line-height:1.8;margin:0 0 10px;opacity:0.9;";
    editor
      .chain()
      .focus()
      .insertContent(`<div style="${styles}">${text}</div>`)
      .run();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Content</div>
        <div className="inline-flex rounded-lg border bg-white p-1">
          <button
            type="button"
            className={`px-2.5 py-1 text-xs rounded ${
              mode === "visual" ? "bg-black text-white" : "text-gray-700"
            }`}
            onClick={() => onModeChange("visual")}
          >
            Visual
          </button>
          <button
            type="button"
            className={`px-2.5 py-1 text-xs rounded ${
              mode === "html" ? "bg-black text-white" : "text-gray-700"
            }`}
            onClick={() => onModeChange("html")}
          >
            HTML
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              Bold
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              Italic
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              Underline
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => insertPreset("title")}
            >
              Title
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => insertPreset("subtitle")}
            >
              Subtitle
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => insertPreset("para")}
            >
              Paragraph
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              Bullets
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              Numbered
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            >
              Left
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() =>
                editor?.chain().focus().setTextAlign("center").run()
              }
            >
              Center
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() =>
                editor?.chain().focus().setTextAlign("right").run()
              }
            >
              Right
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={async () => {
                const url = await prompt({
                  title: "Link URL",
                  placeholder: "https://",
                  confirmText: "Apply",
                });
                if (url) editor?.chain().focus().setLink({ href: url }).run();
              }}
            >
              Link
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().unsetAllMarks().run()}
            >
              Clear
            </button>
          </div>
          <div className="w-full border rounded p-3 text-sm min-h-[200px] bg-white">
            <EditorContent editor={editor} />
          </div>
          <div className="text-xs text-gray-500">
            Use the toolbar for headings, lists, and links. Switch to HTML for
            advanced edits.
          </div>
        </>
      ) : (
        <label className="block space-y-1">
          <div className="text-sm font-medium">HTML</div>
          <textarea
            className="w-full border rounded p-2 text-sm min-h-[200px] font-mono"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      )}
    </div>
  );
}
