"use client";

import { useEffect, useMemo, useState } from "react";

export function useEditorMode(defaultMode: "form" | "json", urlMode?: string) {
  const initial = useMemo(() => {
    if (urlMode === "json" || urlMode === "form") return urlMode;
    if (typeof window === "undefined") return defaultMode;
    const saved = window.localStorage.getItem("editor_mode");
    return saved === "json" || saved === "form" ? saved : defaultMode;
  }, [defaultMode, urlMode]);

  const [mode, setMode] = useState<"form" | "json">(initial as any);

  useEffect(() => {
    window.localStorage.setItem("editor_mode", mode);
  }, [mode]);

  return { mode, setMode };
}
