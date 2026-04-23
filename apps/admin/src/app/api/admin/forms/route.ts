import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { FormSchemaSchema } from "@acme/schemas";
import { listForms, getForm, upsertFormDraft } from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const form_id = searchParams.get("form_id") || "";

  await requireModule({ tenant_id, site_id, module: "forms" });

  if (form_id) {
    const form = await getForm(tenant_id, site_id, form_id);
    return NextResponse.json({ ok: true, form });
  }

  const forms = await listForms(tenant_id, site_id);
  return NextResponse.json({ ok: true, forms });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "forms" });

  const body = await req.json();

  const form_id = String(body.form_id || "");
  const name = String(body.name || "Form").trim();
  const draft_schema = body.draft_schema;

  if (!form_id) {
    return NextResponse.json(
      { ok: false, error: "Missing form_id" },
      { status: 400 }
    );
  }

  const parsed = FormSchemaSchema.safeParse(draft_schema);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid schema", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await upsertFormDraft({
    tenant_id,
    site_id,
    form_id,
    name,
    draft_schema: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
