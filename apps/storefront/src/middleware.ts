import { NextResponse, type NextRequest } from "next/server";

const HANDLE_RE = /^[a-z0-9-]{1,63}$/;
const SID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const handle = req.nextUrl.searchParams.get("handle");
  const sid = req.nextUrl.searchParams.get("sid");
  if (handle && HANDLE_RE.test(handle)) {
    res.cookies.set("storefront_handle", handle, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  if (sid && SID_RE.test(sid)) {
    res.cookies.set("storefront_sid", sid, {
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
