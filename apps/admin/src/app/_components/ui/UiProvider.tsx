"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error";
};

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
};

type PromptOptions = {
  title?: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
};

type AlertOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
};

type DialogState =
  | {
      type: "confirm";
      options: ConfirmOptions;
      resolve: (value: boolean) => void;
    }
  | {
      type: "prompt";
      options: PromptOptions;
      resolve: (value: string | null) => void;
    }
  | {
      type: "alert";
      options: AlertOptions;
      resolve: () => void;
    }
  | null;

type UIContextValue = {
  toast: (t: Omit<Toast, "id">) => void;
  confirm: (o: ConfirmOptions) => Promise<boolean>;
  prompt: (o: PromptOptions) => Promise<string | null>;
  alert: (o: AlertOptions) => Promise<void>;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<DialogState>(null);
  const promptValueRef = useRef<string>("");

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const next: Toast = { id, variant: "default", ...t };
    setToasts((prev) => [next, ...prev]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ type: "confirm", options, resolve });
    });
  }, []);

  const prompt = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      promptValueRef.current = options.defaultValue || "";
      setDialog({ type: "prompt", options, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setDialog({ type: "alert", options, resolve });
    });
  }, []);

  const value = useMemo(
    () => ({ toast, confirm, prompt, alert }),
    [toast, confirm, prompt, alert],
  );

  return (
    <UIContext.Provider value={value}>
      {children}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[260px] max-w-[360px] rounded-xl border shadow-lg px-4 py-3 text-sm bg-white ${
              t.variant === "success"
                ? "border-emerald-200"
                : t.variant === "error"
                  ? "border-red-200"
                  : "border-gray-200"
            }`}
          >
            {t.title ? (
              <div className="font-medium text-gray-900">{t.title}</div>
            ) : null}
            {t.description ? (
              <div className="text-gray-600 mt-1">{t.description}</div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Dialogs */}
      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/70 overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="text-lg font-semibold">
                {dialog.options.title || "Confirm"}
              </div>
              {dialog.options.description ? (
                <div className="text-sm text-gray-600">
                  {dialog.options.description}
                </div>
              ) : null}
              {dialog.type === "prompt" ? (
                <input
                  autoFocus
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder={dialog.options.placeholder}
                  defaultValue={promptValueRef.current}
                  onChange={(e) => {
                    promptValueRef.current = e.target.value;
                  }}
                />
              ) : null}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50/70 flex justify-end gap-3">
              {dialog.type !== "alert" ? (
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    if (dialog.type === "confirm") dialog.resolve(false);
                    if (dialog.type === "prompt") dialog.resolve(null);
                    setDialog(null);
                  }}
                >
                  {dialog.options.cancelText || "Cancel"}
                </button>
              ) : null}
              <button
                className={`px-4 py-2 rounded text-white ${
                  dialog.type === "confirm" && dialog.options.tone === "danger"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
                onClick={() => {
                  if (dialog.type === "confirm") dialog.resolve(true);
                  if (dialog.type === "prompt")
                    dialog.resolve(promptValueRef.current);
                  if (dialog.type === "alert") dialog.resolve();
                  setDialog(null);
                }}
              >
                {dialog.options.confirmText ||
                  (dialog.type === "alert" ? "OK" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error("useUI must be used within UIProvider");
  }
  return ctx;
}
