import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { s3 } from "@acme/core";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

function newKey(args: {
  tenant_id: string;
  site_id: string;
  filename: string;
}) {
  const clean = args.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${args.tenant_id}/${args.site_id}/${Date.now()}_${clean}`;
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const tenant_id = session.user.tenant_id;

    const { searchParams } = new URL(req.url);
    const site_id = searchParams.get("site_id") || "";

    await requireModule({ tenant_id, site_id, module: "assets" });

    const body = await req.json();
    const filename = String(body.filename || "");
    const mime = String(body.mime || "application/octet-stream");

    if (!filename)
      return NextResponse.json(
        { ok: false, error: "Missing filename" },
        { status: 400 },
      );

    const Bucket = process.env.S3_BUCKET || "";
    const cdnBase = process.env.CDN_BASE_URL || "";

    if (!Bucket)
      return NextResponse.json(
        { ok: false, error: "Missing S3_BUCKET" },
        { status: 500 },
      );
    if (!cdnBase)
      return NextResponse.json(
        { ok: false, error: "Missing CDN_BASE_URL" },
        { status: 500 },
      );

    const key = newKey({ tenant_id, site_id, filename });

    // Presigned POST (multipart/form-data)
    const presigned = await createPresignedPost(s3 as any, {
      Bucket,
      Key: key,
      Conditions: [
        ["content-length-range", 0, 10 * 1024 * 1024],
        ["eq", "$Content-Type", mime],
      ],
      Fields: {
        "Content-Type": mime,
      },

      Expires: 60,
    });

    const finalUrl = `${cdnBase.replace(/\/+$/, "")}/${key}`;

    return NextResponse.json({
      ok: true,
      key,
      finalUrl,
      upload: presigned, // { url, fields }
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "sign_failed" },
      { status: 500 },
    );
  }
}
