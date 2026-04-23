import { requireSession } from "@acme/auth";
import { listAttributes } from "@acme/db-mysql/attributes.repo";

export async function GET() {
  const session = await requireSession();
  const attributes = await listAttributes(session.user.tenant_id);
  return Response.json({ ok: true, attributes });
}
