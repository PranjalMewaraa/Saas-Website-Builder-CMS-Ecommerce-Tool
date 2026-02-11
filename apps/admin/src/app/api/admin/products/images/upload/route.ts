import { randomUUID } from "crypto";
import { requireSession, requireModule } from "@acme/auth";
import { newId, nowSql, pool } from "@acme/db-mysql";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;
const CDN_BASE_URL = process.env.CDN_BASE_URL!;

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  const form = await req.formData();
  const product_id = form.get("product_id") as string;
  const variant_id = (form.get("variant_id") as string) || "";
  const file = form.get("file") as File | null;
  const alt = (form.get("alt") as string) || "";

  if (!file || !product_id) {
    return Response.json(
      { ok: false, error: "Missing file or product_id" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";

  const s3Key = `products/${tenant_id}/${product_id}/${randomUUID()}.${ext}`;
  const publicUrl = `https://${CDN_BASE_URL}/${s3Key}`;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const image_id = newId("img").slice(0, 21);
    const ts = nowSql();

    if (variant_id) {
      const [variantRows] = await conn.query<any[]>(
        `SELECT id FROM product_variants
         WHERE id = ? AND tenant_id = ? AND product_id = ?
         LIMIT 1`,
        [variant_id, tenant_id, product_id],
      );
      if (!variantRows.length) {
        throw new Error("Invalid variant_id");
      }
    }

    try {
      await conn.query(
        `INSERT INTO product_images
         (id, tenant_id, product_id, variant_id, url, alt, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [image_id, tenant_id, product_id, variant_id || null, publicUrl, alt, 0, ts],
      );
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("Unknown column 'variant_id'")) {
        if (variant_id) {
          throw new Error(
            "Variant image support requires DB migration: run 003_variant_images.sql",
          );
        }
        await conn.query(
          `INSERT INTO product_images
           (id, tenant_id, product_id, url, alt, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [image_id, tenant_id, product_id, publicUrl, alt, 0, ts],
        );
      } else {
        throw e;
      }
    }

    await conn.commit();

    return Response.json({
      ok: true,
      image: { id: image_id, variant_id: variant_id || null, url: publicUrl, alt },
    });
  } catch (err) {
    await conn.rollback();
    console.error("S3 upload failed:", err);
    return Response.json(
      { ok: false, error: "Upload failed" },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}
