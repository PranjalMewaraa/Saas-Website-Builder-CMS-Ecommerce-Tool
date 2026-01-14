"use client";

export default function BrandDeleteClient({
  siteId,
  brandId,
}: {
  siteId: string;
  brandId: string;
}) {
  return (
    <button
      className="px-3 py-2 rounded border"
      onClick={async () => {
        await fetch(
          `/api/admin/brands/${brandId}?site_id=${encodeURIComponent(siteId)}`,
          { method: "DELETE" }
        );
        window.location.reload();
      }}
    >
      Delete
    </button>
  );
}
