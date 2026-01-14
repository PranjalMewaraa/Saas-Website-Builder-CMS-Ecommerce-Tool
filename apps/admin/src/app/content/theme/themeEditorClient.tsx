"use client";

import { useEffect, useMemo, useState } from "react";
import EditorModeToggle from "../_component/EditorModeToggle";
import { useEditorMode } from "../_component/useEditorMode";
import { useAssetsMap } from "../_component/useAssetsMap";
import ImageField from "../_component/ImageField";

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

export default function ThemeEditorClient({
  siteId,
  urlMode,
}: {
  siteId: string;
  urlMode?: string;
}) {
  const { mode, setMode } = useEditorMode("form", urlMode);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [jsonText, setJsonText] = useState("");
  const { assetsMap } = useAssetsMap(siteId);
  const [brand, setBrand] = useState<{
    logoAssetId?: string;
    logoAlt?: string;
  }>({ logoAssetId: "", logoAlt: "" });

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/admin/theme?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const t = data.theme?.draft_tokens || {};
      const b = data.theme?.brand || { logoAssetId: "", logoAlt: "" };
      setBrand(b);

      setTokens(t);
      setJsonText(JSON.stringify(t, null, 2));
      setLoading(false);
    })();
  }, [siteId]);

  const common = useMemo(
    () => ({
      primary: tokens["--color-primary"] || "",
      bg: tokens["--color-bg"] || "",
      text: tokens["--color-text"] || "",
      dark: tokens["--color-dark"] || "",
      light: tokens["--color-light"] || "",
    }),
    [tokens]
  );

  async function save(nextTokens: Record<string, string>, nextBrand: any) {
    await fetch(`/api/admin/theme?site_id=${encodeURIComponent(siteId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens: nextTokens, brand: nextBrand }),
    });
  }

  if (loading) return <div className="opacity-70">Loading…</div>;

  return (
    <div className="space-y-3 max-w-3xl">
      <EditorModeToggle mode={mode} setMode={setMode} />

      {mode === "form" ? (
        <div className="border rounded p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Field
              label="Primary Color"
              value={common.primary}
              onChange={(v) => updateToken("--color-primary", v)}
            />
            <Field
              label="Background Color"
              value={common.bg}
              onChange={(v) => updateToken("--color-bg", v)}
            />
            <Field
              label="Text Color"
              value={common.text}
              onChange={(v) => updateToken("--color-text", v)}
            />
            <Field
              label="Dark Color"
              value={common.dark}
              onChange={(v) => updateToken("--color-dark", v)}
            />
            <Field
              label="Light Color"
              value={common.light}
              onChange={(v) => updateToken("--color-light", v)}
            />
            <div className="border rounded p-4 space-y-3">
              <div className="font-medium">Brand</div>
              <ImageField
                siteId={siteId}
                label="Global Brand Logo"
                assetIdValue={brand.logoAssetId || ""}
                altValue={brand.logoAlt || ""}
                onChangeAssetId={(v) => setBrand({ ...brand, logoAssetId: v })}
                onChangeAlt={(v) => setBrand({ ...brand, logoAlt: v })}
                assetsMap={assetsMap}
              />
            </div>
          </div>

          <div className="text-sm opacity-70">Custom tokens (advanced)</div>
          <KeyValueEditor
            value={tokens}
            onChange={(next) => {
              setTokens(next);
              setJsonText(JSON.stringify(next, null, 2));
            }}
          />

          <div className="flex gap-2">
            <button
              className="bg-black text-white px-3 py-2 rounded"
              onClick={async () => {
                await save(tokens, brand);

                alert("Saved theme draft ✅");
              }}
              type="button"
            >
              Save Draft
            </button>
          </div>
        </div>
      ) : (
        <div className="border rounded p-4 space-y-2">
          <div className="text-sm opacity-70">Edit tokens JSON</div>
          <textarea
            className="w-full border rounded p-2 font-mono text-sm min-h-[320px]"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          <button
            className="bg-black text-white px-3 py-2 rounded"
            onClick={async () => {
              const parsed = safeJsonParse(jsonText);
              if (!parsed.ok) return alert(parsed.error);
              setTokens(parsed.value);
              await save(parsed.value, brand);
              alert("Saved theme draft ✅");
            }}
            type="button"
          >
            Save Draft
          </button>
        </div>
      )}
    </div>
  );

  function updateToken(key: string, value: string) {
    const next = { ...tokens, [key]: value };
    setTokens(next);
    setJsonText(JSON.stringify(next, null, 2));
  }
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="space-y-1 block">
      <div className="text-sm opacity-70">{label}</div>
      <input
        className="border rounded p-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#2563EB or var(--...)"
      />
    </label>
  );
}

function KeyValueEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const entries = Object.entries(value).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <div className="border rounded p-2 space-y-2">
      {entries.map(([k, v]) => (
        <div key={k} className="grid grid-cols-5 gap-2 items-center">
          <input
            className="border rounded p-2 col-span-2 font-mono text-sm"
            value={k}
            readOnly
          />
          <input
            className="border rounded p-2 col-span-2 font-mono text-sm"
            value={v}
            onChange={(e) => onChange({ ...value, [k]: e.target.value })}
          />
          <button
            className="border rounded p-2 text-sm"
            type="button"
            onClick={() => {
              const next = { ...value };
              delete next[k];
              onChange(next);
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="border rounded px-3 py-2 text-sm"
        type="button"
        onClick={() => {
          const key = prompt("Token key (example: --color-accent)");
          if (!key) return;
          onChange({ ...value, [key]: "#000000" });
        }}
      >
        + Add Token
      </button>
    </div>
  );
}
