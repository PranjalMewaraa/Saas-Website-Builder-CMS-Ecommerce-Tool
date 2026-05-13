import { pool } from "./index";
import { newId, nowSql } from "./id";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export type CustomerUser = {
  id: string;
  tenant_id: string;
  site_id: string;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  email_verified_at: Date | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type CustomerUserPublic = Omit<CustomerUser, "password_hash">;

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function toPublic(u: CustomerUser): CustomerUserPublic {
  const { password_hash: _omit, ...rest } = u;
  return rest;
}

export async function findCustomerUserByEmail(args: {
  tenant_id: string;
  site_id: string;
  email: string;
}): Promise<CustomerUser | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM customer_users
     WHERE tenant_id = ? AND site_id = ? AND email = ?
     LIMIT 1`,
    [args.tenant_id, args.site_id, normalizeEmail(args.email)],
  );
  return (rows[0] as CustomerUser) ?? null;
}

export async function getCustomerUserById(
  id: string,
): Promise<CustomerUser | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM customer_users WHERE id = ? LIMIT 1`,
    [id],
  );
  return (rows[0] as CustomerUser) ?? null;
}

export async function createCustomerUser(args: {
  tenant_id: string;
  site_id: string;
  email: string;
  password_hash: string;
  name?: string | null;
  phone?: string | null;
}): Promise<CustomerUserPublic> {
  const id = newId("cu");
  const ts = nowSql();
  const email = normalizeEmail(args.email);
  await pool.execute<ResultSetHeader>(
    `INSERT INTO customer_users
       (id, tenant_id, site_id, email, password_hash, name, phone, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      args.tenant_id,
      args.site_id,
      email,
      args.password_hash,
      args.name ?? null,
      args.phone ?? null,
      ts,
      ts,
    ],
  );
  const created = await getCustomerUserById(id);
  if (!created) throw new Error("customer_user not found after insert");
  return toPublic(created);
}

export async function recordCustomerLogin(id: string): Promise<void> {
  const ts = nowSql();
  await pool.execute<ResultSetHeader>(
    `UPDATE customer_users SET last_login_at = ?, updated_at = ? WHERE id = ?`,
    [ts, ts, id],
  );
}

export async function listCustomerOrders(args: {
  tenant_id: string;
  customer_id: string;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    order_number: string;
    status: string;
    total_cents: number;
    currency: string;
    created_at: Date;
  }>
> {
  const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, order_number, status, total_cents, currency, created_at
     FROM commerce_orders
     WHERE tenant_id = ? AND customer_id = ?
     ORDER BY created_at DESC
     LIMIT ${limit}`,
    [args.tenant_id, args.customer_id],
  );
  return rows as any;
}
