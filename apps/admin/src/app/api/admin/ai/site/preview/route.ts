import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { isAiSiteCreationEnabledServer } from "@/lib/ai/feature";
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
  const valid = validateAiBlueprint(body?.blueprint);
  if (!valid.ok) {
    return NextResponse.json(
      { ok: false, error: "Invalid blueprint", detail: valid.error },
      { status: 422 },
    );
  }
  return NextResponse.json({
    ok: true,
    phase: "phase_2_preview_validate",
    preview: {
      name: valid.value.name,
      industry: valid.value.industry,
      archetype: valid.value.archetype,
      pages: valid.value.pages.map((p) => ({
        title: p.title,
        slug: p.slug,
        sectionCount: p.sections.length,
      })),
    },
  });
}
