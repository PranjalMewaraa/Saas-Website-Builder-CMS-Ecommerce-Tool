import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { sitesCollection } from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const redirectToRaw = searchParams.get("redirect_to") || "/";

  if (!site_id) {
    return NextResponse.redirect(new URL("/onboarding/create-site", req.url));
  }

  const safeRedirectTo =
    redirectToRaw.startsWith("/") && !redirectToRaw.startsWith("//")
      ? redirectToRaw
      : "/";

  const col = await sitesCollection();
  const site = await col.findOne({ _id: site_id, tenant_id });
  if (!site) {
    return NextResponse.redirect(new URL("/onboarding/create-site", req.url));
  }

  const response = NextResponse.redirect(new URL(safeRedirectTo, req.url));
  response.cookies.set("active_site_id", site._id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
