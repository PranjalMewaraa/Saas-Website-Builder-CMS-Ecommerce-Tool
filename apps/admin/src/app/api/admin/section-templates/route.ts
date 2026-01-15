import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import {
  listTemplatesForSite,
  createSectionTemplate,
  updateSectionTemplateMeta,
  softDeleteTemplate,
  getTemplateById,
} from "@acme/db-mongo";

function newId() {
  return `sectpl_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function cleanTags(input: any): string[] {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .map((x) => String(x).trim())
    .filter(Boolean)
    .slice(0, 20);
}

function cleanScope(input: any): "site" | "tenant" {
  return input === "tenant" ? "tenant" : "site";
}

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const templates = await listTemplatesForSite(tenant_id, site_id);
  return NextResponse.json({ ok: true, templates });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();

  const name = String(body.name || "Section Template").trim();
  const tags = cleanTags(body.tags);

  const scope = cleanScope(body.scope); // "site" or "tenant"

  const section = body.section || {};
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  if (!blocks.length) {
    return NextResponse.json(
      { ok: false, error: "Section has no blocks" },
      { status: 400 }
    );
  }

  for (const b of blocks) {
    if (!b?.type || typeof b.type !== "string") {
      return NextResponse.json(
        { ok: false, error: "Invalid block type in template" },
        { status: 400 }
      );
    }
  }

  const doc = await createSectionTemplate({
    _id: newId(),
    tenant_id,
    scope,
    site_id: scope === "site" ? site_id : undefined,
    name,
    tags,
    section: {
      label: section.label || "",
      style: section.style || {},
      blocks: blocks.map((b: any) => ({
        id: String(b.id || ""),
        type: String(b.type),
        props: b.props ?? {},
        style: b.style ?? {},
      })),
    },
    created_by: session.user.user_id,
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
  });

  return NextResponse.json({ ok: true, template: doc });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();
  const template_id = String(body.template_id || "");
  if (!template_id)
    return NextResponse.json(
      { ok: false, error: "Missing template_id" },
      { status: 400 }
    );

  await updateSectionTemplateMeta({
    tenant_id,
    template_id,
    name: body.name != null ? String(body.name).trim() : undefined,
    tags: body.tags != null ? cleanTags(body.tags) : undefined,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const template_id = searchParams.get("template_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  if (!template_id)
    return NextResponse.json(
      { ok: false, error: "Missing template_id" },
      { status: 400 }
    );

  try {
    await softDeleteTemplate({ tenant_id, site_id, template_id });
  } catch (e: any) {
    if (String(e?.message) === "TEMPLATE_SITE_MISMATCH") {
      return NextResponse.json(
        { ok: false, error: "Template belongs to a different site" },
        { status: 403 }
      );
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}
