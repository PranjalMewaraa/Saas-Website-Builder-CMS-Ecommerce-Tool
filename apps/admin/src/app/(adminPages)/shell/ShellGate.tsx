import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShellClient from "./AdminShell";

export default async function ShellGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const siteId = (await cookieStore).get("active_site_id")?.value;

  const pathname = (await cookieStore).get("x-pathname")?.value || ""; // optional

  const noShell =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/api");

  if (noShell) return <>{children}</>;

  if (!siteId) {
    redirect("/onboarding/create-site");
  }

  return <AdminShellClient siteId={siteId}>{children}</AdminShellClient>;
}
