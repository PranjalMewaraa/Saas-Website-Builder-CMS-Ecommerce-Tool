import { requireSession } from "@acme/auth";
import MenusListClient from "./menuListClient";

export default async function MenusPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; mode?: string }>;
}) {
  await requireSession();
  const resolvedSearchParams = await searchParams;
  const siteId = resolvedSearchParams.site_id || "site_demo";
  const mode = resolvedSearchParams.mode || "";

  return <MenusListClient siteId={siteId} urlMode={mode} />;
}
