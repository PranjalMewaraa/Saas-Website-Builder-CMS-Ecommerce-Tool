import OrdersClient from "./ordersClient";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const sp = await searchParams;
  const siteId = sp.site_id || "";
  return <OrdersClient siteId={siteId} />;
}
