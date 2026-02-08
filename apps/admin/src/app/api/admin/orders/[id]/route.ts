import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { getMongoDb, getOrderById, updateOrderStatus } from "@acme/db-mongo";

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

  const order = await getOrderById(tenant_id, site_id, id);
  const prevStatus = order?.status;

  await updateOrderStatus(tenant_id, site_id, id, status);

  if (order?.customer?.email && prevStatus !== status) {
    const db = await getMongoDb();
    const site = await db.collection("sites").findOne({ _id: site_id });
    await sendOrderStatusEmail({
      to: order.customer.email,
      orderNumber: order.order_number,
      status,
      siteName: site?.name || "Store",
      siteHandle: site?.handle || "",
      siteLogo: site?.logoUrl || site?.brand?.logoUrl || "",
      items: order.items || [],
      totalCents: order.total_cents || 0,
      currency: order.currency || "USD",
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
  const total = formatMoney(args.totalCents || 0, args.currency || "USD");
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
          args.currency || "USD",
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
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
