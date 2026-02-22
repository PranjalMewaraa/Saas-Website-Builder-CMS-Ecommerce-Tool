import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { AI_SITE_TAXONOMY } from "@/lib/ai/site-taxonomy";
import { isAiSiteCreationEnabledServer } from "@/lib/ai/feature";

export async function GET() {
  await requireSession();
  if (!isAiSiteCreationEnabledServer()) {
    return NextResponse.json(
      { ok: false, error: "AI site creation is disabled" },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true, taxonomy: AI_SITE_TAXONOMY });
}
