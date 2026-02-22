import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { sitesCollection } from "@acme/db-mongo/sites.repo";
import { pool } from "@acme/db-mysql";
import { newId, nowSql } from "@acme/db-mysql/id";
import { ensureCommercePages } from "@/lib/auto-pages";
import { listArchetypes, normalizeIndustry } from "@/lib/ai/site-taxonomy";
import { isAiSiteCreationEnabledServer } from "@/lib/ai/feature";
import { generatePhaseOneBlueprint } from "@/lib/ai/site-blueprint-generator";
import { validateAiBlueprint } from "@/lib/ai/blueprint-schema";
import { applyAiBlueprint } from "@/lib/ai/site-apply";

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

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

  const rawName = String(body?.name || "").trim();
  const rawHandle = String(body?.handle || "").trim();
  const prompt = String(body?.prompt || "").trim();
  const ecommerce = Boolean(body?.ecommerce);
  const industry = normalizeIndustry(body?.industry);
  const archetypes = listArchetypes(industry);
  const archetype =
    archetypes.find((a) => a.id === body?.archetype)?.id ||
    archetypes[0]?.id ||
    "";

  if (!rawName) {
    return NextResponse.json(
      { ok: false, error: "Site name is required" },
      { status: 400 },
    );
  }

  const name = rawName;
  const handle = slugify(rawHandle || rawName);
  if (!handle) {
    return NextResponse.json(
      { ok: false, error: "Invalid handle" },
      { status: 400 },
    );
  }

  const site_id = `site_${Date.now()}`;
  const store_id = newId("store").slice(0, 26);
  const ts = nowSql();
  const col = await sitesCollection();

  const doc = {
    _id: site_id,
    tenant_id,
    store_id,
    name,
    handle,
    modules_enabled: {
      catalog: true,
      builder: true,
      themes: true,
      menus: true,
      forms: true,
      assets: true,
      custom_entities: true,
      ai_site_builder: true,
    },
    published_snapshot_id: null,
    ai_bootstrap: {
      enabled: true,
      industry,
      archetype,
      prompt,
      ecommerce,
      status: "seeded",
      created_at: new Date(),
      version: 1,
    },
    created_at: new Date(),
    updated_at: new Date(),
  };

  await col.insertOne(doc as any);
  await pool.query(
    `INSERT INTO stores (id, tenant_id, name, store_type, currency, timezone, status, created_at, updated_at, industry)
     VALUES (?, ?, ?, 'brand', 'INR', 'UTC', 'active', ?, ?, ?)`,
    [store_id, tenant_id, name, ts, ts, industry],
  );
  await ensureCommercePages(tenant_id, site_id);

  let applyMeta: any = null;
  try {
    const providedBlueprint = body?.blueprint;
    const generatedBlueprint = generatePhaseOneBlueprint({
      name,
      handle,
      industry,
      archetype,
      prompt,
      ecommerce,
    });
    const valid = validateAiBlueprint(providedBlueprint || generatedBlueprint);
    if (valid.ok) {
      const allBlueprintSlugs = valid.value.pages.map((p) => p.slug);
      const applied = await applyAiBlueprint({
        tenant_id,
        site_id,
        user_id,
        blueprint: valid.value,
        mode: "replace_selected",
        selected_slugs: allBlueprintSlugs,
      });
      applyMeta = { ok: true, run_id: applied.run_id };
    } else {
      applyMeta = { ok: false, validation: valid.error };
    }
  } catch (err: any) {
    applyMeta = { ok: false, error: err?.message || "apply_failed" };
  }

  return NextResponse.json({
    ok: true,
    phase: "phase_3_create_and_apply",
    message: "AI site created and phase-1 blueprint applied to generated pages.",
    ai_apply: applyMeta,
    site: doc,
  });
}
