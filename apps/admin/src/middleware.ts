import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal middleware to satisfy Next.js.
// Later you can add auth gating / module gating here.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // run on all pages except next internals + api
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
