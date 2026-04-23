import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";

export async function GET(
  _: Request,
  context: { params: Promise<{ siteId: string }> } // ← important: Promise<{ siteId: string }>
) {
  try {
    const session = await requireSession();

    // Safely await params
    const { siteId } = await context.params; // ← this is the key change

    const tenant_id = session.user.tenant_id;
    const site_id = siteId;

    await requireModule({ tenant_id, site_id, module: "catalog" });

    return NextResponse.json({
      ok: true,
      message: "Catalog module is enabled.",
    });
  } catch (e: any) {
    const msg = String(e?.message || e);

    if (msg.includes("UNAUTHORIZED")) {
      return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    }
    if (msg.includes("MODULE_DISABLED")) {
      return NextResponse.json({ ok: false, error: msg }, { status: 403 });
    }
    if (msg.includes("TENANT_NOT_FOUND") || msg.includes("SITE_NOT_FOUND")) {
      return NextResponse.json({ ok: false, error: msg }, { status: 404 });
    }

    // fallback for unexpected errors
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
