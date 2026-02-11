"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

type NewSiteClientProps = {
  onCreated: (site: any) => void;
};

export default function NewSiteClient({ onCreated }: NewSiteClientProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !loading) {
        setOpen(false);
        setError(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, loading]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a site name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/sites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to create site");
      }

      onCreated(data.site);
      setName("");
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setError(null);
    setName("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`
          inline-flex items-center gap-2 rounded-lg 
          bg-gradient-to-b from-gray-900 to-black 
          px-5 py-2.5 text-sm font-medium text-white 
          shadow-md hover:from-gray-800 hover:to-black 
          transition-all active:scale-[0.98]
        `}
      >
        <span className="text-lg leading-none">+</span> New Site
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose} // click outside to close
        >
          {/* Stop propagation so clicks inside modal don't close it */}
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Create New Site
              </h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="site-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Site Name
                </label>
                <input
                  id="site-name"
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  placeholder="e.g. My Online Store"
                  className={`
                    w-full rounded-lg border px-4 py-2.5 text-sm 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-black/30
                    ${error ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-black"}
                  `}
                  disabled={loading}
                />

                {error && (
                  <p className="text-sm text-red-600 mt-1.5">{error}</p>
                )}
              </div>

              <p className="text-xs text-gray-500">
                The site name can be changed later in settings.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className={`
                  px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300
                  hover:bg-gray-100 transition disabled:opacity-50
                `}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className={`
                  inline-flex items-center gap-2 px-6 py-2.5 
                  font-medium rounded-lg text-white shadow-sm
                  transition-all active:scale-[0.98]
                  ${
                    loading
                      ? "bg-gray-400 cursor-wait"
                      : "bg-black hover:bg-gray-900"
                  }
                `}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : "Create Site"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
