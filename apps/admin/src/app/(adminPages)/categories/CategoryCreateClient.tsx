"use client";

export default function CategoryCreateClient({ siteId }: { siteId: string }) {
  return (
    <div className="border rounded p-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);

          const name = String(fd.get("name") || "");
          const slug = String(fd.get("slug") || "");
          const parent_id_raw = String(fd.get("parent_id") || "").trim();
          const parent_id = parent_id_raw ? parent_id_raw : null;

          await fetch(
            `/api/admin/categories?site_id=${encodeURIComponent(siteId)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                slug: slug || undefined,
                parent_id,
              }),
            }
          );

          window.location.reload();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            name="name"
            placeholder="Category name"
            className="border p-2 rounded"
            required
          />
          <input
            name="slug"
            placeholder="slug (optional)"
            className="border p-2 rounded"
          />
          <input
            name="parent_id"
            placeholder="parent_id (optional)"
            className="border p-2 rounded"
          />
        </div>
        <div className="mt-3">
          <button className="bg-black text-white px-3 py-2 rounded">
            Add Category
          </button>
        </div>
        <div className="text-xs opacity-60 mt-2">
          Tip: For MVP, parent_id is manual. Later we’ll replace this with a
          dropdown tree selector.
        </div>
      </form>
    </div>
  );
}
