import { pool } from "./index";
import type { StoreRow } from "./types";

export async function listStores(tenant_id: string): Promise<StoreRow[]> {
  const [rows] = await pool.query(
    `SELECT * FROM stores WHERE tenant_id = ? ORDER BY created_at DESC`,
    [tenant_id]
  );
  return rows as StoreRow[];
}

export async function getStore(
  tenant_id: string,
  store_id: string
): Promise<StoreRow | null> {
  const [rows] = await pool.query(
    `SELECT * FROM stores WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, store_id]
  );
  const arr = rows as StoreRow[];
  return arr[0] ?? null;
}
