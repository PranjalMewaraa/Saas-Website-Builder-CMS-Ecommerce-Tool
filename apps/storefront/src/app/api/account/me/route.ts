import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth/get-customer-session";
import { getCustomerUserById } from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await getCustomerSession(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const user = await getCustomerUserById(session.customer_id);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      tenant_id: user.tenant_id,
      site_id: user.site_id,
      created_at: user.created_at,
    },
  });
}
