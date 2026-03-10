import { NextResponse } from "next/server";
import { requireModule, requireSession } from "@acme/auth";
import { s3 } from "@acme/core";
import { createAsset } from "@acme/db-mongo";
import { PutObjectCommand } from "@aws-sdk/client-s3";

function newAssetId() {
  return `asset_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function newKey(args: { tenant_id: string; site_id: string; filename: string }) {
  const clean = sanitizeFilename(args.filename);
  return `assets/${args.tenant_id}/${args.site_id}/${Date.now()}_${clean}`;
}

export async function POST(req: Request) {
  const reqId = `asset_upload_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  try {
    const session = await requireSession();
    const tenant_id = session.user.tenant_id;
    const { searchParams } = new URL(req.url);
    const site_id = searchParams.get("site_id") || "";

    await requireModule({ tenant_id, site_id, module: "assets" });

    const Bucket = process.env.S3_BUCKET || "";
    const cdnBase = process.env.CDN_BASE_URL || "";
    if (!Bucket) {
      return NextResponse.json(
        { ok: false, error: "Missing S3_BUCKET" },
        { status: 500 },
      );
    }
    if (!cdnBase) {
      return NextResponse.json(
        { ok: false, error: "Missing CDN_BASE_URL" },
        { status: 500 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const alt = String(form.get("alt") || "");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file" },
        { status: 400 },
      );
    }

    const mime = file.type || "application/octet-stream";
    const key = newKey({ tenant_id, site_id, filename: file.name || "upload.bin" });
    const body = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: key,
        Body: body,
        ContentType: mime,
      }),
    );

    const url = `${cdnBase.replace(/\/+$/, "")}/${key}`;
    const doc = await createAsset({
      _id: newAssetId(),
      tenant_id,
      site_id,
      kind: mime.startsWith("image/") ? "image" : "file",
      key,
      url,
      mime,
      size_bytes: file.size || 0,
      alt,
      tags: [],
      folder: "/",
      created_by: session.user.user_id,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    });

    return NextResponse.json({ ok: true, asset: doc });
  } catch (e: unknown) {
    const err = e as { message?: string; name?: string; stack?: string };
    console.error("[assets/upload] failed", {
      reqId,
      message: err?.message || "upload_failed",
      name: err?.name,
      stack: err?.stack,
    });
    return NextResponse.json(
      { ok: false, error: err?.message || "upload_failed" },
      { status: 500 },
    );
  }
}
