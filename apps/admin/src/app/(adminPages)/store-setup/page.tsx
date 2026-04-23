import StoreWizard from "./StoreWizard";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const raw = resolved.site_id;
  const siteId = Array.isArray(raw) ? raw[0] : raw;

  return <StoreWizard siteId={siteId} />;
}
