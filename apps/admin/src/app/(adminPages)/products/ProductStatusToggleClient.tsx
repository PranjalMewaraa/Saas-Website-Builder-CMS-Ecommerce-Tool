"use client";

export default function ProductStatusToggleClient(props: {
  siteId: string;
  productId: string;
  status: "draft" | "active" | "archived";
  onChanged?: (nextStatus: "draft" | "active") => void;
}) {
  const { siteId, productId, status, onChanged } = props;
  const isActive = status === "active";

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
        isActive
          ? "border-transparent bg-accent-soft text-accent"
          : "border-transparent bg-draft-soft text-draft"
      }`}
      onClick={async () => {
        const nextStatus: "draft" | "active" = isActive ? "draft" : "active";
        const res = await fetch(
          `/api/admin/products?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_id: productId,
              status: nextStatus,
            }),
          },
        );
        if (!res.ok) return;
        if (onChanged) {
          onChanged(nextStatus);
          return;
        }
        window.location.reload();
      }}
      title={isActive ? "Switch to Draft" : "Switch to Active"}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />
      {isActive ? "Active" : "Draft"}
    </button>
  );
}

