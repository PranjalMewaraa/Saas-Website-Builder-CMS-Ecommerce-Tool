import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { isAiSiteCreationEnabledServer } from "@/lib/ai/feature";
import { generatePhaseOneBlueprint } from "@/lib/ai/site-blueprint-generator";
import { validateAiBlueprint } from "@/lib/ai/blueprint-schema";

export async function POST(req: Request) {
  await requireSession();
  if (!isAiSiteCreationEnabledServer()) {
    return NextResponse.json(
      { ok: false, error: "AI site creation is disabled" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Site name is required" },
      { status: 400 },
    );
  }

  const blueprint = generatePhaseOneBlueprint({
    name,
    handle: body?.handle,
    industry: body?.industry,
    archetype: body?.archetype,
    prompt: body?.prompt,
    ecommerce: Boolean(body?.ecommerce),
  });
  const valid = validateAiBlueprint(blueprint);
  if (!valid.ok) {
    return NextResponse.json(
      { ok: false, error: "Generated blueprint validation failed", detail: valid.error },
      { status: 422 },
    );
  }

  return NextResponse.json({
    ok: true,
    phase: "phase_2_generate_preview",
    blueprint: valid.value,
  });
}
