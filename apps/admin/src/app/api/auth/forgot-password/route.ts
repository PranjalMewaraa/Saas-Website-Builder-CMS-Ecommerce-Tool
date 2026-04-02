import { NextResponse } from "next/server";
import { findUsersByEmail, updateUserPasswordById } from "@acme/db-mongo/";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const nextPassword = String(password || "");

  if (!normalizedEmail || !nextPassword) {
    return NextResponse.json(
      { ok: false, error: "Email and new password are required." },
      { status: 400 },
    );
  }

  if (nextPassword.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const users = await findUsersByEmail(normalizedEmail);
  if (!users.length) {
    return NextResponse.json(
      { ok: false, error: "No account found for this email." },
      { status: 404 },
    );
  }

  if (users.length > 1) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Multiple accounts use this email. Resolve duplicates before resetting here.",
      },
      { status: 409 },
    );
  }

  const user = users[0];
  await updateUserPasswordById({
    user_id: user._id,
    password: nextPassword,
  });

  return NextResponse.json({
    ok: true,
    message: "Password updated. You can now log in with the new password.",
  });
}
