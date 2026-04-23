import { requireSession, requireModule } from "@acme/auth";
import { pool } from "@acme/db-mysql";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

  const { image_id } = await req.json();

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows]: any = await conn.query(
      `SELECT url FROM product_images WHERE id = ? AND tenant_id = ?`,
      [image_id, tenant_id],
    );

    if (!rows.length) {
      await conn.rollback();
      return Response.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const url: string = rows[0].url;
    const key = url.replace(`https://${CDN_BASE_URL}/`, "");

    await conn.query(
      `DELETE FROM product_images WHERE id = ? AND tenant_id = ?`,
      [image_id, tenant_id],
    );

    await conn.commit();

    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );

    return Response.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("Delete failed:", err);
    return Response.json({ ok: false }, { status: 500 });
  } finally {
    conn.release();
  }
}
