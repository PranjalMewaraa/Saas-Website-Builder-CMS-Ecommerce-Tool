import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { listOrders } from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const status = searchParams.get("status") || "";

  if (!site_id) {
    return NextResponse.json({ ok: false, error: "site_id required" }, { status: 400 });
  }

  const orders = await listOrders(tenant_id, site_id, status || undefined);
  return NextResponse.json({ ok: true, orders });
}
