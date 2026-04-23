import Link from "next/link";

export default function Nav({
  siteId,
  storeId,
}: {
  siteId: string;
  storeId: string;
}) {
  const qp = `?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`;
  return (
    <div className="border-b p-3 flex gap-4">
      <Link href={`/stores?site_id=${siteId}`} className="font-semibold">
        Stores
      </Link>
      <Link href={`/brands?site_id=${siteId}&store_id=${storeId}`}>Brands</Link>
      <Link href={`/categories?site_id=${siteId}&store_id=${storeId}`}>
        Categories
      </Link>
      <Link href={`/products${qp}`}>Products</Link>
    </div>
  );
}
