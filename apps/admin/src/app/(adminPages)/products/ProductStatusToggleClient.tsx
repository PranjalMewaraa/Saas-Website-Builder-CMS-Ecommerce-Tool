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
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
        isActive
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-amber-300 bg-amber-50 text-amber-800"
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
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isActive ? "bg-emerald-600" : "bg-amber-600"
        }`}
      />
      {isActive ? "Active" : "Draft"}
    </button>
  );
}

