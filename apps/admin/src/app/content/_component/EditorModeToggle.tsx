"use client";

export default function EditorModeToggle({
  mode,
  setMode,
}: {
  mode: "form" | "json";
  setMode: (m: "form" | "json") => void;
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
    </div>
  );
}
