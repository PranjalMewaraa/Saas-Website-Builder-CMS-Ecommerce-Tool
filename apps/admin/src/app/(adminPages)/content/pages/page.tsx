import { requireSession } from "@acme/auth";
import PagesClient from "./PagesClient";

export default async function PagesIndex({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  await requireSession();

  const resolved = await searchParams;
  const siteId = resolved.site_id || "site_demo";

  return <PagesClient siteId={siteId} />;
}
