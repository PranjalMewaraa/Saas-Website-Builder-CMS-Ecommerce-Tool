"use client";

export default function BrandCreateClient({ siteId }: { siteId: string }) {
  return (
    <div className="border rounded p-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);
          const name = String(fd.get("name") || "");
          const slug = String(fd.get("slug") || "");
          await fetch(
            `/api/admin/brands?site_id=${encodeURIComponent(siteId)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, slug: slug || undefined }),
            }
          );
          window.location.reload();
        }}
      >
        <div className="flex gap-2">
          <input
            name="name"
            placeholder="Brand name"
            className="border p-2 rounded flex-1"
            required
          />
          <input
            name="slug"
            placeholder="slug (optional)"
            className="border p-2 rounded flex-1"
          />
          <button className="bg-black text-white px-3 rounded">Add</button>
        </div>
      </form>
    </div>
  );
}
