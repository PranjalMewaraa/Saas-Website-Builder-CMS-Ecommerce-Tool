"use client";

import React, { useRef } from "react";

export default function ColorPickerInput({
  label,
  value,
  onChange,
  placeholder,
  palette = [],
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  palette?: string[];
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <label className="block space-y-1.5 min-w-0">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-10 w-12 rounded border shadow-sm shrink-0"
          style={{ backgroundColor: value || "transparent" }}
          title={value || "Pick color"}
          aria-label={`${label} color picker`}
        />
        <input
          ref={inputRef}
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <input
          className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {palette.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {palette.map((c) => (
            <button
              key={c}
              type="button"
              className="h-6 w-6 rounded border shadow-sm"
              style={{ backgroundColor: c }}
              onClick={() => onChange(c)}
              title={c}
            />
          ))}
        </div>
      )}
    </label>
  );
}
