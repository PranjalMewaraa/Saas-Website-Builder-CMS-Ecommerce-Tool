// ← adjust path to where your pool is exported
import { requireSession, requireModule } from "@acme/auth";
import { pool } from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const product_id = searchParams.get("product_id");
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  if (!product_id) {
    return Response.json(
      { ok: false, error: "Missing product_id" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();

  try {
    let rows: any[] = [];
    try {
      const [withVariant] = await conn.query(
        `SELECT id, variant_id, url, alt, sort_order, created_at
         FROM product_images 
         WHERE tenant_id = ? AND product_id = ?
         ORDER BY sort_order ASC, created_at ASC`,
        [tenant_id, product_id],
      );
      rows = withVariant as any[];
    } catch {
      const [legacy] = await conn.query(
        `SELECT id, url, alt, sort_order, created_at
         FROM product_images 
         WHERE tenant_id = ? AND product_id = ?
         ORDER BY sort_order ASC, created_at ASC`,
        [tenant_id, product_id],
      );
      rows = (legacy as any[]).map((r) => ({ ...r, variant_id: null }));
    }

    return Response.json({
      ok: true,
      images: rows,
    });
  } catch (err) {
    console.error("Failed to fetch product images:", err);
    return Response.json(
      { ok: false, error: "Failed to retrieve images" },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}
