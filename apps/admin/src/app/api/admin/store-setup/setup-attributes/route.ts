import { requireSession, requireModule } from "@acme/auth";
import { createAttribute } from "@acme/db-mysql/attributes.repo";
import { INDUSTRY_TEMPLATES } from "@acme/db-mysql/industryTemplate";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { industry, site_id } = await req.json();
  await requireModule({ tenant_id, site_id, module: "catalog" });
  console.log("Industry", industry);
  const template = INDUSTRY_TEMPLATES[industry] || [];
  console.log("Template", template);
  for (const attr of template) {
    console.log("attr pass", attr);
    await createAttribute(tenant_id, attr);
  }

  return Response.json({ ok: true });
}
