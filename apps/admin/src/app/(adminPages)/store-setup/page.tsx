import StoreWizard from "./StoreWizard";

export default function Page({ searchParams }: any) {
  return <StoreWizard siteId={searchParams.site_id} />;
}
