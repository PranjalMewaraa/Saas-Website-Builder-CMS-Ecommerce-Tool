import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { findSiteById } from "@acme/db-mongo/sites.repo";
import {
  isAiSiteBuilderModuleEnabled,
  isAiSiteCreationEnabledServer,
} from "@/lib/ai/feature";
import { validateAiBlueprint } from "@/lib/ai/blueprint-schema";
import { applyAiBlueprint, type ApplyMode } from "@/lib/ai/site-apply";

export async function POST(req: Request) {
  if (!isAiSiteCreationEnabledServer()) {
    return NextResponse.json(
      { ok: false, error: "AI site creation is disabled" },
      { status: 403 },
    );
  }
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const user_id = session.user.id || "unknown";
  const body = await req.json().catch(() => ({}));
  const site_id = String(body?.site_id || "").trim();
  if (!site_id) {
    return NextResponse.json(
      { ok: false, error: "site_id is required" },
      { status: 400 },
    );
  }
  const site = await findSiteById(site_id);
  if (!site || site.tenant_id !== tenant_id) {
    return NextResponse.json(
      { ok: false, error: "SITE_NOT_FOUND" },
      { status: 404 },
    );
  }
  if (!isAiSiteBuilderModuleEnabled((site as any).modules_enabled)) {
    return NextResponse.json(
      { ok: false, error: "AI_SITE_BUILDER_MODULE_DISABLED" },
      { status: 403 },
    );
  }

  const valid = validateAiBlueprint(body?.blueprint);
  if (!valid.ok) {
    return NextResponse.json(
      { ok: false, error: "Invalid blueprint", detail: valid.error },
      { status: 422 },
    );
  }

  const mode: ApplyMode =
    body?.mode === "replace_selected" ? "replace_selected" : "append_only";
  const selected_slugs = Array.isArray(body?.selected_slugs)
    ? body.selected_slugs.map((v: any) => String(v || "").trim()).filter(Boolean)
    : [];

  try {
    const result = await applyAiBlueprint({
      tenant_id,
      site_id,
      user_id,
      blueprint: valid.value,
      mode,
      selected_slugs,
    });
    const { ok: _ok, ...rest } = result as any;
    return NextResponse.json({
      ok: true,
      phase: "phase_3_apply",
      ...rest,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to apply blueprint" },
      { status: 500 },
    );
  }
}
