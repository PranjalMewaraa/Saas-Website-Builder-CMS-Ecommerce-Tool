import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { pool } from "@acme/db-mysql";
import { newId, nowSql } from "@acme/db-mysql/id";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();

  const store_id = newId("store");
  const ts = nowSql();

  await pool.query(
    `INSERT INTO stores (id, tenant_id, name, store_type, currency, timezone, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'USD', 'UTC', 'active', ?, ?)`,
    [store_id, tenant_id, body.name, body.store_type, ts, ts],
  );

  return NextResponse.json({ ok: true, store_id });
}
