import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { createSite, sitesCollection } from "@acme/db-mongo/sites.repo";
import { getOrCreateHomePage } from "@acme/db-mongo/pages.repo";
import { updateTenantOnboarding } from "@acme/db-mongo/tenants.repo";
import { listArchetypes, normalizeIndustry } from "@/lib/ai/site-taxonomy";
import { isAiSiteCreationEnabledServer } from "@/lib/ai/feature";
import { generatePhaseOneBlueprint } from "@/lib/ai/site-blueprint-generator";
import { validateAiBlueprint } from "@/lib/ai/blueprint-schema";
import { applyAiBlueprint } from "@/lib/ai/site-apply";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

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

  const site_id = id("site");
  const site = await createSite({ site_id, tenant_id, name, handle });
  await getOrCreateHomePage(tenant_id, site_id);

  const ai_bootstrap = {
    enabled: true,
    industry,
    archetype,
    prompt,
    ecommerce,
    status: "seeded",
    created_at: new Date(),
    version: 1,
  };

  const col = await sitesCollection();
  await col.updateOne(
    { _id: site_id, tenant_id },
    { $set: { ai_bootstrap, updated_at: new Date() } },
  );

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

  await updateTenantOnboarding(tenant_id, {
    completed: true,
    step: "done",
    site_id,
  });

  return NextResponse.json({
    ok: true,
    site_id: site._id,
    phase: "phase_3_create_and_apply",
    ai_apply: applyMeta,
  });
}
