import { requireSession } from "@acme/auth";
import { createAttribute } from "@acme/db-mysql/attributes.repo";
import { INDUSTRY_TEMPLATES } from "@acme/db-mysql/industryTemplate";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { industry } = await req.json();
  console.log("Industry", industry);
  const template = INDUSTRY_TEMPLATES[industry] || [];
  console.log("Template", template);
  for (const attr of template) {
    console.log("attr pass", attr);
    await createAttribute(tenant_id, attr);
  }

  return Response.json({ ok: true });
}
