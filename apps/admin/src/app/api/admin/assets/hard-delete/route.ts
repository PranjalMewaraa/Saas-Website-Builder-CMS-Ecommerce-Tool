import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { s3 } from "@acme/core";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { assetsCollection } from "@acme/db-mongo";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "assets" });

  const body = await req.json();
  const asset_id = String(body.asset_id || "");
  if (!asset_id)
    return NextResponse.json(
      { ok: false, error: "Missing asset_id" },
      { status: 400 }
    );

  const col = await assetsCollection();
  const asset = await col.findOne({ _id: asset_id, tenant_id, site_id });

  if (!asset)
    return NextResponse.json(
      { ok: false, error: "Asset not found" },
      { status: 404 }
    );

  // 1) soft delete in DB (so it disappears immediately)
  await col.updateOne(
    { _id: asset_id, tenant_id, site_id },
    { $set: { is_deleted: true, updated_at: new Date() } }
  );

  // 2) best-effort delete from storage
  try {
    const Bucket = process.env.S3_BUCKET!;
    const Key = asset.key;
    await s3.send(new DeleteObjectCommand({ Bucket, Key }));
  } catch (e) {
    // do not fail the request; DB is already updated
    // you can log this later
  }

  return NextResponse.json({ ok: true });
}
