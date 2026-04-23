import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireSession } from "@acme/auth";
import { sitesCollection } from "@acme/db-mongo";
import AdminShellClient from "./AdminShell";

export default async function ShellGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const siteId = (await cookieStore).get("active_site_id")?.value || "";

  const pathname = (await cookieStore).get("x-pathname")?.value || ""; // optional

  const noShell =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/api");

  if (noShell) return <>{children}</>;

  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const sites = await sitesCollection();

  if (siteId) {
    const activeSite = await sites.findOne({ _id: siteId, tenant_id });
    if (activeSite) {
      return <AdminShellClient siteId={siteId}>{children}</AdminShellClient>;
    }
  }

  const fallbackSite = await sites.findOne(
    { tenant_id },
    { sort: { created_at: 1 } },
  );

  if (!fallbackSite) {
    redirect("/onboarding/create-site");
  }

  const redirectTo = pathname || "/";
  redirect(
    `/api/admin/sites/activate?site_id=${encodeURIComponent(fallbackSite._id)}&redirect_to=${encodeURIComponent(redirectTo)}`,
  );
}
