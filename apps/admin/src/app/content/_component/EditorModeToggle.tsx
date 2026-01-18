"use client";

export default function EditorModeToggle({
  mode,
  setMode,
}: {
  mode: "form" | "json" | "visual";
  setMode: (m: "form" | "json" | "visual") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm opacity-70">Editor:</span>
      <button
        className={`px-3 py-1 rounded border text-sm ${mode === "form" ? "bg-black text-white" : ""}`}
        onClick={() => setMode("form")}
        type="button"
      >
        Form
      </button>
      <button
        className={`px-3 py-1 rounded border text-sm ${mode === "json" ? "bg-black text-white" : ""}`}
        onClick={() => setMode("json")}
        type="button"
      >
        JSON
      </button>
      <button
        className={`px-3 py-1 rounded border text-sm ${mode === "visual" ? "bg-black text-white" : ""}`}
        onClick={() => setMode("visual")}
        type="button"
      >
        Visual
      </button>
    </div>
  );
}
