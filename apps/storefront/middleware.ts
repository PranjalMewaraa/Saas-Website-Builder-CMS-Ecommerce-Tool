import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle") || "";
  const host = req.nextUrl.hostname;

  const headers = new Headers(req.headers);

  if (handle) headers.set("x-site-handle", handle);
  headers.set("x-site-host", host);
  console.log("MIDDLEWARE URL:", req.nextUrl.href);
  console.log("MIDDLEWARE HANDLE:", handle);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: ["/:path*"],
};
