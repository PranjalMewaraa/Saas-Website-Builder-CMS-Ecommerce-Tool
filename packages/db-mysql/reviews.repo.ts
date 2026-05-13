import { pool } from "./index";
import { newId, nowSql } from "./id";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export type ReviewStatus = "pending" | "published" | "rejected";

export type ProductReview = {
  id: string;
  tenant_id: string;
  site_id: string;
  product_id: string;
  customer_id: string;
  customer_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: number;
  status: ReviewStatus;
  created_at: Date;
  updated_at: Date;
};

export type RatingSummary = {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export async function customerHasPurchasedProduct(args: {
  tenant_id: string;
  customer_id: string;
  product_id: string;
}): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 1
       FROM commerce_orders o
       JOIN commerce_order_items i ON i.order_id = o.id AND i.tenant_id = o.tenant_id
      WHERE o.tenant_id = ?
        AND o.customer_id = ?
        AND i.product_id = ?
      LIMIT 1`,
    [args.tenant_id, args.customer_id, args.product_id],
  );
  return rows.length > 0;
}

export async function findReviewByCustomer(args: {
  tenant_id: string;
  site_id: string;
  product_id: string;
  customer_id: string;
}): Promise<ProductReview | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM product_reviews
      WHERE tenant_id = ? AND site_id = ? AND product_id = ? AND customer_id = ?
      LIMIT 1`,
    [args.tenant_id, args.site_id, args.product_id, args.customer_id],
  );
  return (rows[0] as ProductReview) ?? null;
}

export async function createProductReview(args: {
  tenant_id: string;
  site_id: string;
  product_id: string;
  customer_id: string;
  customer_name?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  is_verified: boolean;
}): Promise<ProductReview> {
  const id = newId("rev");
  const ts = nowSql();
  const rating = Math.min(5, Math.max(1, Math.round(args.rating)));
  await pool.execute<ResultSetHeader>(
    `INSERT INTO product_reviews
       (id, tenant_id, site_id, product_id, customer_id, customer_name, rating, title, body, is_verified, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
    [
      id,
      args.tenant_id,
      args.site_id,
      args.product_id,
      args.customer_id,
      args.customer_name ?? null,
      rating,
      args.title ?? null,
      args.body ?? null,
      args.is_verified ? 1 : 0,
      ts,
      ts,
    ],
  );
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM product_reviews WHERE id = ?`,
    [id],
  );
  return rows[0] as ProductReview;
}

export async function listProductReviews(args: {
  tenant_id: string;
  site_id: string;
  product_id: string;
  limit?: number;
  offset?: number;
}): Promise<ProductReview[]> {
  const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
  const offset = Math.max(args.offset ?? 0, 0);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM product_reviews
      WHERE tenant_id = ? AND site_id = ? AND product_id = ? AND status = 'published'
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}`,
    [args.tenant_id, args.site_id, args.product_id],
  );
  return rows as ProductReview[];
}

export async function getProductRatingSummary(args: {
  tenant_id: string;
  site_id: string;
  product_id: string;
}): Promise<RatingSummary> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT rating, COUNT(*) AS n
       FROM product_reviews
      WHERE tenant_id = ? AND site_id = ? AND product_id = ? AND status = 'published'
      GROUP BY rating`,
    [args.tenant_id, args.site_id, args.product_id],
  );
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let total = 0;
  let weighted = 0;
  for (const row of rows as Array<{ rating: number; n: number }>) {
    const r = Math.max(1, Math.min(5, Number(row.rating))) as 1 | 2 | 3 | 4 | 5;
    const n = Number(row.n || 0);
    distribution[r] = n;
    total += n;
    weighted += r * n;
  }
  return {
    count: total,
    average: total ? Math.round((weighted / total) * 10) / 10 : 0,
    distribution,
  };
}
