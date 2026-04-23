import { requireSession } from "@acme/auth";
import BuilderClient from "./builderClient";

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
  //               ^^^^^^^ required in Next.js 15+
}) {
  await requireSession();

  const resolvedSearchParams = await searchParams;
  const siteId = resolvedSearchParams.site_id || "site_demo";

  return <BuilderClient siteId={siteId} />;
}
