import { requireSession } from "@acme/auth";
import { createAttribute } from "@acme/db-mysql/attributes.repo";
import { INDUSTRY_TEMPLATES } from "@acme/db-mysql/industryTemplate";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { industry } = await req.json();

  const template = INDUSTRY_TEMPLATES[industry] || [];

  for (const attr of template) {
    await createAttribute(tenant_id, attr);
  }

  return Response.json({ ok: true });
}
