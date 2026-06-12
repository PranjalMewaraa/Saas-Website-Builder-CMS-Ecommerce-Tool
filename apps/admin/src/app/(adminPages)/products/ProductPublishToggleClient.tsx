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
      type="button"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
        isPublished
          ? "border-transparent bg-accent-soft text-accent"
          : "border-line bg-canvas text-muted"
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
      <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />
      {isPublished ? "Published" : "Unpublished"}
    </button>
  );
}
