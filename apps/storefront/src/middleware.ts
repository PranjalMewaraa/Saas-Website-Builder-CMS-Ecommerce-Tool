import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const handle = req.nextUrl.searchParams.get("handle");
  if (handle) {
    res.cookies.set("storefront_handle", handle, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}

export const config = {
  matcher: ["/:path*"],
};

