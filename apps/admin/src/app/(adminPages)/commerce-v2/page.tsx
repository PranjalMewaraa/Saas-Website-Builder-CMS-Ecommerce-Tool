import CommerceV2Client from "./CommerceV2Client";

export default async function CommerceV2Page({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; store_id?: string }>;
}) {
  const params = await searchParams;
  const siteId = params.site_id || "";
  const storeId = params.store_id || "";
  return (
    <div className="p-6">
      <CommerceV2Client siteId={siteId} storeId={storeId} />
    </div>
  );
}
