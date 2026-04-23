import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth/require-session";
import { sitesCollection } from "@acme/db-mongo";

export async function POST(req: Request) {
  const session = await requireSession();
  const { site_id, token } = await req.json();

  const col = await sitesCollection();

  await col.updateOne(
    { _id: site_id, tenant_id: session.user.tenant_id },
    { $set: { google_verification: token } },
  );

  return NextResponse.json({ ok: true });
}
