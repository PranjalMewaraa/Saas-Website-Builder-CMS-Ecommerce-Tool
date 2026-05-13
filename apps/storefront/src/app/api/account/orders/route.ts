import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth/get-customer-session";
import { listCustomerOrders } from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await getCustomerSession(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const orders = await listCustomerOrders({
    tenant_id: session.tenant_id,
    customer_id: session.customer_id,
    limit: 50,
  });
  return NextResponse.json({ ok: true, orders });
}
