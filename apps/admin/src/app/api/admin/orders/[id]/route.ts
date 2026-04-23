import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { getMongoDb, getOrderById, updateOrderStatus } from "@acme/db-mongo";
import { pool } from "@acme/db-mysql";

function parseMaybeJson(value: any) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return {};
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const { id } = await params;

  if (!site_id) {
    return NextResponse.json({ ok: false, error: "site_id required" }, { status: 400 });
  }

  const [rows] = await pool.query<any[]>(
    `SELECT * FROM commerce_orders WHERE tenant_id = ? AND site_id = ? AND id = ? LIMIT 1`,
    [tenant_id, site_id, id],
  );
  if (rows[0]) {
    const [items] = await pool.query<any[]>(
      `SELECT * FROM commerce_order_items WHERE tenant_id = ? AND order_id = ? ORDER BY created_at ASC`,
      [tenant_id, id],
    );
    const productIds = Array.from(
      new Set((items || []).map((i: any) => String(i.product_id || "")).filter(Boolean)),
    );
    const variantIds = Array.from(
      new Set((items || []).map((i: any) => String(i.variant_id || "")).filter(Boolean)),
    );

    let productMap: Record<string, any> = {};
    if (productIds.length) {
      const [productRows] = await pool.query<any[]>(
        `SELECT p.id, p.slug, p.description,
                b.name AS brand_name,
                sc.name AS store_category_name,
                pi.url AS image_url
         FROM products p
         LEFT JOIN brands b
           ON b.tenant_id = p.tenant_id
          AND b.id = p.brand_id
         LEFT JOIN store_categories sc
           ON sc.tenant_id = p.tenant_id
          AND sc.id = p.store_category_id
         LEFT JOIN (
           SELECT tenant_id, product_id, MIN(sort_order) AS min_sort
           FROM product_images
           WHERE tenant_id = ?
           GROUP BY tenant_id, product_id
         ) pim ON pim.tenant_id = p.tenant_id AND pim.product_id = p.id
         LEFT JOIN product_images pi
           ON pi.tenant_id = pim.tenant_id
          AND pi.product_id = pim.product_id
          AND pi.sort_order = pim.min_sort
         WHERE p.tenant_id = ? AND p.id IN (?)`,
        [tenant_id, tenant_id, productIds],
      );
      productMap = Object.fromEntries(
        (productRows || []).map((r: any) => [String(r.id), r]),
      );
    }

    let productCategoryNames: Record<string, string[]> = {};
    if (productIds.length) {
      const [catRows] = await pool.query<any[]>(
        `SELECT pc.product_id, c.name
         FROM product_categories pc
         JOIN categories c
           ON c.tenant_id = pc.tenant_id
          AND c.id = pc.category_id
         WHERE pc.tenant_id = ? AND pc.product_id IN (?)`,
        [tenant_id, productIds],
      );
      for (const row of catRows || []) {
        const pid = String(row.product_id || "");
        if (!pid) continue;
        if (!productCategoryNames[pid]) productCategoryNames[pid] = [];
        if (row.name && !productCategoryNames[pid].includes(String(row.name))) {
          productCategoryNames[pid].push(String(row.name));
        }
      }
    }

    let variantMap: Record<string, any> = {};
    if (variantIds.length) {
      const [variantRows] = await pool.query<any[]>(
        `SELECT id, sku, options_json FROM product_variants WHERE tenant_id = ? AND id IN (?)`,
        [tenant_id, variantIds],
      );
      variantMap = Object.fromEntries(
        (variantRows || []).map((r: any) => [String(r.id), r]),
      );
    }

    const order = {
      _id: rows[0].id,
      order_number: rows[0].order_number,
      status: rows[0].status,
      total_cents: rows[0].total_cents,
      customer: parseMaybeJson(rows[0].customer_json),
      shipping_address: parseMaybeJson(rows[0].shipping_json),
      items: (items || []).map((i) => ({
        id: i.id,
        product_id: i.product_id,
        variant_id: i.variant_id,
        title: i.title,
        sku: i.sku || variantMap[String(i.variant_id || "")]?.sku || null,
        slug: productMap[String(i.product_id)]?.slug || "",
        description: productMap[String(i.product_id)]?.description || "",
        image_url: productMap[String(i.product_id)]?.image_url || "",
        brand_name: productMap[String(i.product_id)]?.brand_name || "",
        category_names: Array.from(
          new Set(
            [
              productMap[String(i.product_id)]?.store_category_name || "",
              ...(productCategoryNames[String(i.product_id)] || []),
            ].filter(Boolean),
          ),
        ),
        variant_options: parseMaybeJson(variantMap[String(i.variant_id || "")]?.options_json || null),
        variant_label: (() => {
          const opts = parseMaybeJson(
            variantMap[String(i.variant_id || "")]?.options_json || null,
          );
          if (!opts || typeof opts !== "object") return "";
          const entries = Object.entries(opts).filter(
            ([k, v]) =>
              k !== "default" &&
              v != null &&
              String(v).trim() !== "" &&
              String(v).toLowerCase() !== "true",
          );
          return entries.map(([k, v]) => `${k}: ${String(v)}`).join(" · ");
        })(),
        qty: i.quantity,
        price_cents: i.price_cents,
        line_total_cents:
          i.line_total_cents != null
            ? Number(i.line_total_cents)
            : Number(i.price_cents || 0) * Number(i.quantity || 0),
      })),
      created_at: rows[0].created_at,
      source: "mysql_v2",
    };
    return NextResponse.json({ ok: true, order });
  }

  const order = await getOrderById(tenant_id, site_id, id);
  return NextResponse.json({ ok: true, order });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const { id } = await params;
  const body = await req.json();
  const status = body.status;

  if (!site_id) {
    return NextResponse.json({ ok: false, error: "site_id required" }, { status: 400 });
  }
  if (!status) {
    return NextResponse.json({ ok: false, error: "status required" }, { status: 400 });
  }

  const [rows] = await pool.query<any[]>(
    `SELECT * FROM commerce_orders WHERE tenant_id = ? AND site_id = ? AND id = ? LIMIT 1`,
    [tenant_id, site_id, id],
  );
  if (rows[0]) {
    await pool.query(
      `UPDATE commerce_orders SET status = ?, updated_at = NOW() WHERE tenant_id = ? AND site_id = ? AND id = ?`,
      [status, tenant_id, site_id, id],
    );
    return NextResponse.json({ ok: true });
  }

  const order = await getOrderById(tenant_id, site_id, id);
  const prevStatus = order?.status;

  await updateOrderStatus(tenant_id, site_id, id, status);

  if (order?.customer?.email && prevStatus !== status) {
    const db = await getMongoDb();
    const site = await db.collection("sites").findOne({ _id: site_id } as any);
    await sendOrderStatusEmail({
      to: order.customer.email,
      orderNumber: order.order_number,
      status,
      siteName: site?.name || "Store",
      siteHandle: site?.handle || "",
      siteLogo: site?.logoUrl || site?.brand?.logoUrl || "",
      items: order.items || [],
      totalCents: order.total_cents || 0,
      currency: order.currency || "INR",
      customerName: order.customer?.name || "",
      shipping: order.shipping_address || {},
      fromEmail: session.user.email || "",
    });
  }
  return NextResponse.json({ ok: true });
}

async function sendOrderStatusEmail(args: {
  to: string;
  orderNumber: string;
  status: string;
  siteName: string;
  siteHandle: string;
  siteLogo: string;
  items: any[];
  totalCents: number;
  currency: string;
  customerName: string;
  shipping: any;
  fromEmail: string;
}) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM || "";
  if (!apiKey || !from) return;

  const subject = `Your order ${args.orderNumber} is now ${args.status}`;
  const html = renderOrderStatusHtml(args);
  const fromAddress = args.fromEmail || from;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [args.to],
      subject,
      html,
      ...(args.fromEmail && args.fromEmail !== from
        ? { reply_to: args.fromEmail }
        : {}),
    }),
  });
}

function renderOrderStatusHtml(args: {
  orderNumber: string;
  status: string;
  siteName: string;
  siteHandle: string;
  siteLogo: string;
  items: any[];
  totalCents: number;
  currency: string;
  customerName: string;
  shipping: any;
}) {
  const statusLabel = args.status.replace(/_/g, " ");
  const base =
    process.env.STOREFRONT_BASE_URL || "http://localhost:3002";
  const orderUrl = args.siteHandle
    ? `${base}/orders/${args.orderNumber}?handle=${args.siteHandle}`
    : "";
  const total = formatMoney(args.totalCents || 0, args.currency || "INR");
  const itemRows = (args.items || [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding:8px 0;color:#0f172a;font-size:13px;">${escapeHtml(
          item.title || "Item",
        )}</td>
        <td style="padding:8px 0;color:#64748b;font-size:13px;text-align:center;">${
          item.qty || 1
        }</td>
        <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${formatMoney(
          item.price_cents || 0,
          args.currency || "INR",
        )}</td>
      </tr>
    `,
    )
    .join("");
  const ship = args.shipping || {};
  const shipLine = [ship.address1, ship.address2]
    .filter(Boolean)
    .join(", ");
  const shipCity = [ship.city, ship.state, ship.zip].filter(Boolean).join(", ");
  return `
  <div style="font-family: Inter, Arial, sans-serif; background:#f8fafc; padding:32px;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;padding:28px;">
      <div style="display:flex;align-items:center;gap:12px;">
        ${
          args.siteLogo
            ? `<img src="${args.siteLogo}" alt="${escapeHtml(
                args.siteName,
              )}" style="height:28px;width:auto;"/>`
            : `<div style="font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(
                args.siteName,
              )}</div>`
        }
      </div>

      <div style="margin-top:14px;font-size:22px;font-weight:700;color:#0f172a;">
        Your order is now ${statusLabel}
      </div>
      <div style="margin-top:6px;color:#475569;font-size:14px;">
        Hi ${escapeHtml(args.customerName || "there")}, your order
        <strong>${escapeHtml(args.orderNumber)}</strong> status has changed.
      </div>

      <div style="margin-top:16px;padding:14px 16px;border-radius:12px;background:#f1f5f9;color:#0f172a;font-size:14px;">
        New status: <strong>${statusLabel}</strong>
      </div>

      ${
        orderUrl
          ? `<div style="margin-top:16px;">
            <a href="${orderUrl}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;">
              View order
            </a>
          </div>`
          : ""
      }

      <div style="margin-top:22px;font-size:14px;font-weight:600;color:#0f172a;">
        Order summary
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 0;color:#94a3b8;font-size:11px;font-weight:600;">Item</th>
            <th style="text-align:center;padding:6px 0;color:#94a3b8;font-size:11px;font-weight:600;">Qty</th>
            <th style="text-align:right;padding:6px 0;color:#94a3b8;font-size:11px;font-weight:600;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows || ""}
          <tr>
            <td style="padding-top:10px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;" colspan="2">
              Total
            </td>
            <td style="padding-top:10px;border-top:1px solid #e2e8f0;text-align:right;color:#0f172a;font-weight:600;font-size:13px;">
              ${total}
            </td>
          </tr>
        </tbody>
      </table>

      ${
        shipLine || shipCity || ship.country
          ? `<div style="margin-top:20px;">
            <div style="font-size:14px;font-weight:600;color:#0f172a;">Shipping address</div>
            <div style="font-size:13px;color:#475569;margin-top:4px;">
              ${escapeHtml(shipLine)}
            </div>
            <div style="font-size:13px;color:#475569;">
              ${escapeHtml(shipCity)}
            </div>
            <div style="font-size:13px;color:#475569;">
              ${escapeHtml(ship.country || "")}
            </div>
          </div>`
          : ""
      }

      <div style="margin-top:20px;color:#64748b;font-size:12px;">
        If you have questions, reply to this email.
      </div>
    </div>
  </div>
  `;
}

function formatMoney(cents: number, currency: string) {
  const value = (cents || 0) / 100;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
}

function escapeHtml(input: string) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
