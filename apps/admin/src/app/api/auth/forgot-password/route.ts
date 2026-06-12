import { NextResponse } from "next/server";

// Disabled: the previous implementation reset any account's password given only
// an email + new password, with no token or ownership proof (account takeover).
// A real reset flow requires email delivery + expiring tokens, neither of which
// exists yet. Until then the endpoint is closed rather than left exploitable.
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Password reset is temporarily unavailable. Contact support to reset your password.",
    },
    { status: 410 },
  );
}
