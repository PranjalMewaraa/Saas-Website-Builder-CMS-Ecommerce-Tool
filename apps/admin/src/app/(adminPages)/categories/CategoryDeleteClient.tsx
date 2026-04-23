"use client";

export default function CategoryDeleteClient({
  siteId,
  categoryId,
}: {
  siteId: string;
  categoryId: string;
}) {
  return (
    <button
      className="px-3 py-2 rounded border"
      onClick={async () => {
        await fetch(
          `/api/admin/categories/${categoryId}?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "DELETE",
          }
        );
        window.location.reload();
      }}
    >
      Delete
    </button>
  );
}
