import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import {
  listBlockTemplatesForSite,
  createBlockTemplate,
  updateBlockTemplateMeta,
  softDeleteBlockTemplate,
} from "@acme/db-mongo";

function newId() {
  return `blktpl_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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

function cleanCategory(input: any): string | undefined {
  const s = String(input || "").trim();
  return s ? s.slice(0, 50) : undefined;
}

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  await requireModule({ tenant_id, site_id, module: "builder" });

  const templates = await listBlockTemplatesForSite(tenant_id, site_id);
  return NextResponse.json({ ok: true, templates });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();
  const name = String(body.name || "Block Template").trim();
  const tags = cleanTags(body.tags);
  const category = cleanCategory(body.category);
  const scope = cleanScope(body.scope);
  const block = body.block || {};

  if (!block?.type || typeof block.type !== "string") {
    return NextResponse.json(
      { ok: false, error: "Invalid block type in template" },
      { status: 400 },
    );
  }

  const doc = await createBlockTemplate({
    _id: newId(),
    tenant_id,
    scope,
    site_id: scope === "site" ? site_id : undefined,
    name,
    category,
    tags,
    block: {
      id: String(block.id || ""),
      type: String(block.type),
      props: block.props ?? {},
      style: block.style ?? {},
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
  if (!template_id) {
    return NextResponse.json(
      { ok: false, error: "Missing template_id" },
      { status: 400 },
    );
  }

  await updateBlockTemplateMeta({
    tenant_id,
    template_id,
    name: body.name != null ? String(body.name).trim() : undefined,
    category: body.category != null ? cleanCategory(body.category) : undefined,
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

  if (!template_id) {
    return NextResponse.json(
      { ok: false, error: "Missing template_id" },
      { status: 400 },
    );
  }

  try {
    await softDeleteBlockTemplate({ tenant_id, site_id, template_id });
  } catch (e: any) {
    if (String(e?.message) === "TEMPLATE_SITE_MISMATCH") {
      return NextResponse.json(
        { ok: false, error: "Template belongs to a different site" },
        { status: 403 },
      );
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}
