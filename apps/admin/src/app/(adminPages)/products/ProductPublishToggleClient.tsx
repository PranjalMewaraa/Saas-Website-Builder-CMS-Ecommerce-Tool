"use client";

export default function ProductPublishToggleClient(props: {
  siteId: string;
  storeId: string;
  productId: string;
  isPublished: boolean;
  onChanged?: (nextPublished: boolean) => void;
}) {
  const { siteId, storeId, productId, isPublished, onChanged } = props;

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
        isPublished
          ? "border-sky-300 bg-sky-50 text-sky-800"
          : "border-slate-300 bg-slate-50 text-slate-700"
      }`}
      onClick={async () => {
        const nextPublished = !isPublished;
        const res = await fetch(
          `/api/admin/store-products/publish?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              store_id: storeId,
              product_id: productId,
              is_published: nextPublished,
            }),
          }
        );
        if (!res.ok) return;
        if (onChanged) {
          onChanged(nextPublished);
          return;
        }
        window.location.reload();
      }}
      title={isPublished ? "Switch to Unpublished" : "Switch to Published"}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isPublished ? "bg-sky-600" : "bg-slate-500"
        }`}
      />
      {isPublished ? "Published" : "Unpublished"}
    </button>
  );
}
