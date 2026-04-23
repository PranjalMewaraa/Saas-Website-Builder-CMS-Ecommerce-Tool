import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { pool } from "@acme/db-mysql";
import { newId, nowSql } from "@acme/db-mysql/id";
import { ensureCommercePages } from "@/lib/auto-pages";
import { ensureStoreProfile, seedStorePreset } from "@acme/db-mysql";
import { getMongoDb } from "@acme/db-mongo";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const tenant_id = session.user.tenant_id;
    const body = await req.json();
    const site_id = String(body.site_id || "");
    const name = String(body.name || "").trim();
    const store_type =
      body.store_type === "distributor" ? "distributor" : "brand";
    const preset = String(body.industry || "").trim() || null;

    if (!site_id) {
      return NextResponse.json(
        { ok: false, error: "site_id is required" },
        { status: 400 },
      );
    }
    if (!name) {
      return NextResponse.json(
        { ok: false, error: "name is required" },
        { status: 400 },
      );
    }

    await requireModule({ tenant_id, site_id, module: "catalog" });

    const store_id = newId("store");
    const finalStoreId = store_id.slice(0, 26);
    const ts = nowSql();
    const [countRows] = await pool.query<any[]>(
      `SELECT COUNT(*) as c FROM stores WHERE tenant_id = ?`,
      [tenant_id],
    );
    const existingStoreCount = Number(countRows[0]?.c || 0);

    await pool.query(
      `INSERT INTO stores (id, tenant_id, name, store_type, currency, timezone, status, created_at, updated_at,industry)
       VALUES (?, ?, ?, ?, 'INR', 'IST', 'active', ?, ?, ?)`,
      [finalStoreId, tenant_id, name, store_type, ts, ts, preset],
    );

    await ensureStoreProfile({
      tenant_id,
      store_id: finalStoreId,
      store_preset: preset,
    });

    if (preset) {
      await seedStorePreset({
        tenant_id,
        store_id: finalStoreId,
        preset: preset as any,
      });
    }

    const db = await getMongoDb();
    const sites = db.collection("sites");
    const currentSite = await sites.findOne({ _id: site_id as any, tenant_id });

    // Requirement:
    // - first store setup should become active immediately.
    // - new sites may already have one bootstrap store, so allow <=1.
    // - if site has no store bound, bind this one.
    if (existingStoreCount <= 1 || !currentSite?.store_id) {
      await sites.updateOne(
        { _id: site_id as any, tenant_id },
        { $set: { store_id: finalStoreId, updated_at: new Date() } },
      );
    }

    // Non-fatal: pages may already exist or be created elsewhere.
    try {
      await ensureCommercePages(tenant_id, site_id);
    } catch (e: any) {
      console.warn("[create-store] ensureCommercePages skipped:", e?.message || e);
    }

    return NextResponse.json({ ok: true, store_id: finalStoreId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to create store" },
      { status: 500 },
    );
  }
}
