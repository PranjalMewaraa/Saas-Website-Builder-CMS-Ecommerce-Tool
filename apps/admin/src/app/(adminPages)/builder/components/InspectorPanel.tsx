"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import StyleEditor from "./StyleEditor";

// ✅ IMPORTANT: builder-safe registry (NO mysql imports)
import { getBlockBuilder } from "@acme/blocks/registry/builder";

type Breakpoint = "desktop" | "tablet" | "mobile";

export default function InspectorPanel({
  siteId,
  snapshotLike,
  block,
  onChange,
}: {
  siteId: string;
  snapshotLike: any;
  block: any;
  onChange: (next: any) => void;
}) {
  const [bp, setBp] = useState<Breakpoint>("desktop");

  const def = useMemo(
    () => (block ? getBlockBuilder(block.type) : null),
    [block?.type]
  );
  if (!block) return <div className="opacity-70 text-sm">Select a block</div>;
  if (!def)
    return (
      <div className="opacity-70 text-sm">Unknown block type: {block.type}</div>
    );

  const parsed = def.schema.safeParse(block.props ?? {});
  const props = parsed.success ? parsed.data : (block.props ?? {});
  const schema = def.schema as z.ZodTypeAny;

  return (
    <div className="space-y-4">
      <div>
        <div className="font-semibold">Inspector</div>
        <div className="text-xs opacity-60">{block.type}</div>
      </div>

      {!parsed.success ? (
        <div className="border rounded p-2 text-xs bg-red-50">
          Props invalid. You can still edit; publish will fail if invalid.
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="text-sm font-medium">Props</div>
        <PropsEditor
          schema={schema}
          value={props}
          onChange={(nextProps) => onChange({ ...block, props: nextProps })}
          snapshotLike={snapshotLike}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Style</div>
          <div className="flex gap-2">
            <button
              className={`border rounded px-2 py-1 text-xs ${bp === "desktop" ? "bg-black text-white" : ""}`}
              onClick={() => setBp("desktop")}
              type="button"
            >
              Desktop
            </button>
            <button
              className={`border rounded px-2 py-1 text-xs ${bp === "tablet" ? "bg-black text-white" : ""}`}
              onClick={() => setBp("tablet")}
              type="button"
            >
              Tablet
            </button>
            <button
              className={`border rounded px-2 py-1 text-xs ${bp === "mobile" ? "bg-black text-white" : ""}`}
              onClick={() => setBp("mobile")}
              type="button"
            >
              Mobile
            </button>
          </div>
        </div>

        <StyleEditor
          siteId={siteId}
          snapshotLike={snapshotLike}
          block={block}
          breakpoint={bp}
          onChange={(nextStyle) => onChange({ ...block, style: nextStyle })}
        />
      </div>
    </div>
  );
}

/** Nested Zod editor (objects + arrays + primitives) */
function PropsEditor({
  schema,
  value,
  onChange,
  snapshotLike,
}: {
  schema: z.ZodTypeAny;
  value: any;
  onChange: (v: any) => void;
  snapshotLike: any;
}) {
  const shape = unwrapObjectShape(schema);
  if (!shape) {
    return (
      <textarea
        className="w-full border rounded p-2 font-mono text-xs min-h-[160px]"
        value={JSON.stringify(value ?? {}, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(shape).map(([key, fieldSchema]) => (
        <Field
          key={key}
          label={key}
          schema={fieldSchema}
          value={(value ?? {})[key]}
          onChange={(v: any) => onChange({ ...(value ?? {}), [key]: v })}
          snapshotLike={snapshotLike}
        />
      ))}
    </div>
  );
}

function Field({ label, schema, value, onChange, snapshotLike }: any) {
  const base = unwrap(schema);

  // dropdown helpers
  if (label === "formId") {
    const options = Object.keys(snapshotLike.forms || {});
    return (
      <label className="block space-y-1">
        <div className="text-xs opacity-70">{label}</div>
        <select
          className="border rounded p-2 w-full text-sm"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (label === "menuId") {
    const options = Object.keys(snapshotLike.menus || {});
    return (
      <label className="block space-y-1">
        <div className="text-xs opacity-70">{label}</div>
        <select
          className="border rounded p-2 w-full text-sm"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (base instanceof z.ZodObject) {
    // @ts-ignore
    const shape = base.shape as Record<string, z.ZodTypeAny>;
    return (
      <div className="border rounded p-2 space-y-2">
        <div className="text-xs font-semibold">{label}</div>
        {Object.entries(shape).map(([k, s]) => (
          <Field
            key={k}
            label={k}
            schema={s}
            value={(value ?? {})[k]}
            onChange={(v: any) => onChange({ ...(value ?? {}), [k]: v })}
            snapshotLike={snapshotLike}
          />
        ))}
      </div>
    );
  }

  if (base instanceof z.ZodArray) {
    const itemSchema = base.element;
    const items = Array.isArray(value) ? value : [];
    return (
      <div className="border rounded p-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold">{label}</div>
          <button
            className="border rounded px-2 py-1 text-xs"
            type="button"
            onClick={() => onChange([...items, defaultValueFor(itemSchema)])}
          >
            + Add
          </button>
        </div>
        {items.map((it: any, i: number) => (
          <div key={i} className="border rounded p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs opacity-70">Item {i + 1}</div>
              <button
                className="border rounded px-2 py-1 text-xs"
                type="button"
                onClick={() =>
                  onChange(items.filter((_: any, idx: number) => idx !== i))
                }
              >
                Remove
              </button>
            </div>
            <Field
              label={`${label}[${i}]`}
              schema={itemSchema}
              value={it}
              onChange={(v: any) => {
                const next = [...items];
                next[i] = v;
                onChange(next);
              }}
              snapshotLike={snapshotLike}
            />
          </div>
        ))}
        {items.length === 0 ? (
          <div className="text-xs opacity-60">No items</div>
        ) : null}
      </div>
    );
  }

  if (base instanceof z.ZodBoolean) {
    return (
      <label className="flex items-center gap-2 border rounded p-2">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm">{label}</span>
      </label>
    );
  }

  if (base instanceof z.ZodNumber) {
    return (
      <label className="block space-y-1">
        <div className="text-xs opacity-70">{label}</div>
        <input
          className="border rounded p-2 w-full text-sm"
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    );
  }

  if (base instanceof z.ZodEnum) {
    return (
      <label className="block space-y-1">
        <div className="text-xs opacity-70">{label}</div>
        <select
          className="border rounded p-2 w-full text-sm"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {base.options.map((o: any) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }

  // string + fallback
  return (
    <label className="block space-y-1">
      <div className="text-xs opacity-70">{label}</div>
      <input
        className="border rounded p-2 w-full text-sm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function defaultValueFor(schema: z.ZodTypeAny) {
  const base = unwrap(schema);
  if (base instanceof z.ZodString) return "";
  if (base instanceof z.ZodNumber) return 0;
  if (base instanceof z.ZodBoolean) return false;
  if (base instanceof z.ZodEnum) return base.options[0];
  if (base instanceof z.ZodObject) return {};
  if (base instanceof z.ZodArray) return [];
  return null;
}

function unwrap(schema: z.ZodTypeAny): z.ZodTypeAny {
  let s = schema;
  while (
    s instanceof z.ZodOptional ||
    s instanceof z.ZodNullable ||
    s instanceof z.ZodDefault
  ) {
    // @ts-ignore
    s = s._def.innerType || s._def.schema;
  }
  return s;
}

function unwrapObjectShape(
  schema: z.ZodTypeAny
): Record<string, z.ZodTypeAny> | null {
  const s = unwrap(schema);
  if (s instanceof z.ZodObject) {
    // @ts-ignore
    return s.shape;
  }
  return null;
}
