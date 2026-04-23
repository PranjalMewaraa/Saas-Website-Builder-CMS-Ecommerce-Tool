import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";

export async function GET() {
  const session = await requireSession();
  return NextResponse.json({ ok: true, user: session.user });
}
