"use client";

import { useEffect, useMemo, useState } from "react";

type EditorMode = "form" | "json" | "visual";

export function useEditorMode(
  defaultMode: EditorMode,
  urlMode?: string,
  allowedModes: EditorMode[] = ["form", "json", "visual"],
) {
  const initial = useMemo<EditorMode>(() => {
    // 1. URL param wins
    if (urlMode === "json" || urlMode === "form" || urlMode === "visual") {
      if (allowedModes.includes(urlMode)) return urlMode;
    }

    // 2. SSR fallback
    if (typeof window === "undefined") return defaultMode;

    // 3. localStorage fallback
    const saved = window.localStorage.getItem("editor_mode");
    if (saved === "json" || saved === "form" || saved === "visual") {
      if (allowedModes.includes(saved)) return saved;
    }

    // 4. default
    return allowedModes.includes(defaultMode) ? defaultMode : allowedModes[0];
  }, [defaultMode, urlMode]);

  const [mode, setMode] = useState<EditorMode>(initial);

  useEffect(() => {
    window.localStorage.setItem("editor_mode", mode);
  }, [mode]);

  return { mode, setMode };
}
