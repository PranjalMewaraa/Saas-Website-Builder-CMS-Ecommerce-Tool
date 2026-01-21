import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { sitesCollection } from "@acme/db-mongo";

export async function GET() {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const col = await sitesCollection();
  const sites = await col.find({ tenant_id }).toArray();

  return NextResponse.json({ ok: true, sites });
}
