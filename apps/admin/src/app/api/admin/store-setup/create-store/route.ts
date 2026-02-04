import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { pool } from "@acme/db-mysql";
import { newId, nowSql } from "@acme/db-mysql/id";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";

  await requireModule({ tenant_id, site_id, module: "catalog" });

  const store_id = newId("store");
  const finalStoreId = store_id.slice(0, 20);
  const ts = nowSql();

  await pool.query(
    `INSERT INTO stores (id, tenant_id, name, store_type, currency, timezone, status, created_at, updated_at,industry)
     VALUES (?, ?, ?, ?, 'INR', 'IST', 'active', ?, ?,?)`,
    [
      finalStoreId,
      tenant_id,
      body.name,
      body.store_type,
      ts,
      ts,
      body.industry,
    ],
  );

  return NextResponse.json({ ok: true, store_id: finalStoreId });
}
