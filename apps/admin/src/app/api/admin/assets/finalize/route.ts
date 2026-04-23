import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { createAsset } from "@acme/db-mongo";

function newId() {
  return `asset_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function POST(req: Request) {
  const reqId = `asset_finalize_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  try {
    const session = await requireSession();
    const tenant_id = session.user.tenant_id;

    const { searchParams } = new URL(req.url);
    const site_id = searchParams.get("site_id") || "";
    console.info("[assets/finalize] start", { reqId, tenant_id, site_id });

    await requireModule({ tenant_id, site_id, module: "assets" });

    const body = await req.json();
    const { key, url, mime, size_bytes, width, height, alt } = body;

    if (!key || !url) {
      console.warn("[assets/finalize] missing params", {
        reqId,
        hasKey: !!key,
        hasUrl: !!url,
      });
      return NextResponse.json(
        { ok: false, error: "Missing key/url" },
        { status: 400 },
      );
    }

    const doc = await createAsset({
      _id: newId(),
      tenant_id,
      site_id,
      kind: mime?.startsWith("image/") ? "image" : "file",
      key,
      url,
      mime: mime || "application/octet-stream",
      size_bytes: Number(size_bytes || 0),
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      alt: alt || "",
      tags: [],
      folder: "/",
      created_by: session.user.user_id,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    });

    console.info("[assets/finalize] success", {
      reqId,
      assetId: doc?._id,
      key,
      kind: doc?.kind,
    });
    return NextResponse.json({ ok: true, asset: doc });
  } catch (e: any) {
    console.error("[assets/finalize] failed", {
      reqId,
      message: e?.message || "finalize_failed",
      name: e?.name,
      stack: e?.stack,
    });
    return NextResponse.json(
      { ok: false, error: e?.message || "finalize_failed" },
      { status: 500 },
    );
  }
}
