import { pool } from "../../db-mysql";

export type GridProduct = {
  id: string;
  slug: string;
  title: string;
  base_price_cents: number;
};

export async function listPublishedProductsForStore(args: {
  tenant_id: string;
  store_id: string;
  limit: number;
}): Promise<GridProduct[]> {
  const [rows] = await pool.query(
    `
    SELECT p.id, p.slug, p.title, p.base_price_cents
    FROM store_products sp
    JOIN products p
      ON p.id = sp.product_id
     AND p.tenant_id = sp.tenant_id
    WHERE sp.tenant_id = ?
      AND sp.store_id = ?
      AND sp.is_published = 1
      AND p.status = 'active'
    ORDER BY p.created_at DESC
    LIMIT ?
    `,
    [args.tenant_id, args.store_id, args.limit]
  );

  return rows as GridProduct[];
}
