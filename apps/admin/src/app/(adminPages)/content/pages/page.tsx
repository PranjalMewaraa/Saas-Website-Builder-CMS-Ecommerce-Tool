import { requireSession } from "@acme/auth";
import PagesClient from "./PagesClient";

export default async function PagesIndex({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; onboarding?: string }>;
}) {
  await requireSession();

  const resolved = await searchParams;
  const siteId = resolved.site_id || "site_demo";
  const showOnboardingGuide = resolved.onboarding === "1";

  return <PagesClient siteId={siteId} showOnboardingGuide={showOnboardingGuide} />;
}
