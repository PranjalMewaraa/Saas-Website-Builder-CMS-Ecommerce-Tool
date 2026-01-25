import StoreWizard from "./StoreWizard";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const siteId = resolved.site_id as string | undefined; // or handle array/undefined as needed

  return <StoreWizard siteId={siteId} />;
}
