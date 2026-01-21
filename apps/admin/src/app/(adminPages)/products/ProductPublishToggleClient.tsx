"use client";

export default function ProductPublishToggleClient(props: {
  siteId: string;
  storeId: string;
  productId: string;
  isPublished: boolean;
}) {
  const { siteId, storeId, productId, isPublished } = props;

  return (
    <button
      className={`px-3 py-2 rounded border ${isPublished ? "bg-black text-white" : ""}`}
      onClick={async () => {
        await fetch(
          `/api/admin/store-products/publish?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              store_id: storeId,
              product_id: productId,
              is_published: !isPublished,
            }),
          }
        );
        window.location.reload();
      }}
    >
      {isPublished ? "Published" : "Unpublished"}
    </button>
  );
}
