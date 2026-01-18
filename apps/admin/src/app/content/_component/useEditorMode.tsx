"use client";

import { useEffect, useMemo, useState } from "react";

type EditorMode = "form" | "json" | "visual";

export function useEditorMode(defaultMode: EditorMode, urlMode?: string) {
  const initial = useMemo<EditorMode>(() => {
    // 1. URL param wins
    if (urlMode === "json" || urlMode === "form" || urlMode === "visual") {
      return urlMode;
    }

    // 2. SSR fallback
    if (typeof window === "undefined") return defaultMode;

    // 3. localStorage fallback
    const saved = window.localStorage.getItem("editor_mode");
    if (saved === "json" || saved === "form" || saved === "visual") {
      return saved;
    }

    // 4. default
    return defaultMode;
  }, [defaultMode, urlMode]);

  const [mode, setMode] = useState<EditorMode>(initial);

  useEffect(() => {
    window.localStorage.setItem("editor_mode", mode);
  }, [mode]);

  return { mode, setMode };
}
