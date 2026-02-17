import { NextResponse } from "next/server";
import { requireModule, requireSession } from "@acme/auth";
import {
  archivePromotion,
  createPromotion,
  listPromotions,
  updatePromotion,
} from "@acme/db-mysql";
import { resolveStoreId } from "@/lib/store-scope";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = await resolveStoreId({
    tenant_id,
    site_id,
    store_id: searchParams.get("store_id") || "",
  });
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!store_id) {
    return NextResponse.json(
      { ok: false, error: "Missing store_id" },
      { status: 400 },
    );
  }
  const promotions = await listPromotions({
    tenant_id,
    store_id,
    include_archived: searchParams.get("include_archived") === "1",
  });
  return NextResponse.json({ ok: true, promotions });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json().catch(() => ({}));
  const site_id = String(body.site_id || "");
  const store_id = await resolveStoreId({
    tenant_id,
    site_id,
    store_id: String(body.store_id || ""),
  });
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!store_id || !site_id || !String(body.name || "").trim()) {
    return NextResponse.json(
      { ok: false, error: "site_id, store_id and name are required" },
      { status: 400 },
    );
  }
  try {
    const created = await createPromotion({
      tenant_id,
      site_id,
      store_id,
      name: String(body.name || ""),
      code: body.code || null,
      is_active: body.is_active !== false,
      is_secret: !!body.is_secret,
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      discount_type: body.discount_type === "fixed" ? "fixed" : "percent",
      discount_scope: body.discount_scope === "items" ? "items" : "order",
      discount_value: Number(body.discount_value || 0),
      min_order_cents: Math.max(0, Number(body.min_order_cents || 0)),
      max_discount_cents:
        body.max_discount_cents == null
          ? null
          : Math.max(0, Number(body.max_discount_cents || 0)),
      usage_limit_total:
        body.usage_limit_total == null
          ? null
          : Math.max(0, Number(body.usage_limit_total || 0)),
      usage_limit_per_customer:
        body.usage_limit_per_customer == null
          ? null
          : Math.max(0, Number(body.usage_limit_per_customer || 0)),
      first_n_customers:
        body.first_n_customers == null
          ? null
          : Math.max(0, Number(body.first_n_customers || 0)),
      stackable: !!body.stackable,
      priority: Number(body.priority || 0),
      targets: Array.isArray(body.targets) ? body.targets : [],
    });
    return NextResponse.json({ ok: true, promotion_id: created.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to create promotion" },
      { status: 400 },
    );
  }
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json().catch(() => ({}));
  const site_id = String(body.site_id || "");
  const promotion_id = String(body.promotion_id || "");
  const store_id = await resolveStoreId({
    tenant_id,
    site_id,
    store_id: String(body.store_id || ""),
  });
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!store_id || !promotion_id) {
    return NextResponse.json(
      { ok: false, error: "store_id and promotion_id are required" },
      { status: 400 },
    );
  }
  try {
    await updatePromotion({
      tenant_id,
      store_id,
      promotion_id,
      patch: {
        name: body.name,
        code: body.code,
        is_active: body.is_active,
        is_secret: body.is_secret,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        discount_type: body.discount_type,
        discount_scope: body.discount_scope,
        discount_value:
          body.discount_value == null ? undefined : Number(body.discount_value),
        min_order_cents:
          body.min_order_cents == null
            ? undefined
            : Number(body.min_order_cents),
        max_discount_cents:
          body.max_discount_cents == null
            ? null
            : Number(body.max_discount_cents),
        usage_limit_total:
          body.usage_limit_total == null
            ? null
            : Number(body.usage_limit_total),
        usage_limit_per_customer:
          body.usage_limit_per_customer == null
            ? null
            : Number(body.usage_limit_per_customer),
        first_n_customers:
          body.first_n_customers == null
            ? null
            : Number(body.first_n_customers),
        stackable: body.stackable,
        priority: body.priority == null ? undefined : Number(body.priority),
        targets: Array.isArray(body.targets) ? body.targets : undefined,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to update promotion" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const promotion_id = searchParams.get("promotion_id") || "";
  const store_id = await resolveStoreId({
    tenant_id,
    site_id,
    store_id: searchParams.get("store_id") || "",
  });
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!store_id || !promotion_id) {
    return NextResponse.json(
      { ok: false, error: "store_id and promotion_id are required" },
      { status: 400 },
    );
  }
  await archivePromotion({ tenant_id, store_id, promotion_id });
  return NextResponse.json({ ok: true });
}

