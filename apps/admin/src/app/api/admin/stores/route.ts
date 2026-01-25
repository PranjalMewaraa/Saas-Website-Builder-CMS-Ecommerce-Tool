import { requireSession } from "@acme/auth";
import { listStores } from "@acme/db-mysql";

export async function GET() {
  const session = await requireSession();
  const stores = await listStores(session.user.tenant_id);

  return Response.json({ stores });
}
