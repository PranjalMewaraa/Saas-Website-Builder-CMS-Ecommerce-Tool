import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// No-op middleware. Per-route `requireSession()` in every /api/admin/* handler
// enforces auth (verified by `git grep -L requireSession apps/admin/src/app/api/admin`
// — the one previously-missing route was patched directly in this PR).
//
// An earlier version of this file ran `getToken` from `next-auth/jwt` here as
// defence-in-depth, but that pulled the next-auth Edge bundle into the admin
// middleware compile and caused first-compile stalls on /content/pages/edit.
// If revisiting, use a minimal JWT decoder (jose) rather than next-auth/jwt.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
