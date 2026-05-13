import { NextResponse } from "next/server";
import {
  getProductV2BySlug,
  listProductReviews,
  getProductRatingSummary,
  createProductReview,
  findReviewByCustomer,
  customerHasPurchasedProduct,
} from "@acme/db-mysql";
import { resolveSiteFromRequest } from "@/lib/resolve-site";
import { getCustomerSession } from "@/lib/auth/get-customer-session";

async function resolveProduct(req: Request, slug: string) {
  const site = await resolveSiteFromRequest(req);
  if (!site || !site.tenant_id) return null;
  const storeId = (site as any).store_id;
  if (!storeId) return null;
  const product = await getProductV2BySlug({
    tenant_id: site.tenant_id,
    store_id: String(storeId),
    slug,
  });
  if (!product) return null;
  return {
    tenant_id: site.tenant_id,
    site_id: String(site._id),
    store_id: String(storeId),
    product_id: String((product as any).id),
  };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const resolved = await resolveProduct(req, slug);
  if (!resolved) {
    return NextResponse.json(
      { ok: false, error: "product_not_found" },
      { status: 404 },
    );
  }
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 20);
  const offset = Number(url.searchParams.get("offset") || 0);

  const [reviews, summary] = await Promise.all([
    listProductReviews({
      tenant_id: resolved.tenant_id,
      site_id: resolved.site_id,
      product_id: resolved.product_id,
      limit,
      offset,
    }),
    getProductRatingSummary({
      tenant_id: resolved.tenant_id,
      site_id: resolved.site_id,
      product_id: resolved.product_id,
    }),
  ]);
  return NextResponse.json({ ok: true, summary, reviews });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await getCustomerSession(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const { slug } = await context.params;
  const resolved = await resolveProduct(req, slug);
  if (!resolved) {
    return NextResponse.json(
      { ok: false, error: "product_not_found" },
      { status: 404 },
    );
  }
  if (
    session.tenant_id !== resolved.tenant_id ||
    session.site_id !== resolved.site_id
  ) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 },
    );
  }
  const rating = Number(body?.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { ok: false, error: "invalid_rating" },
      { status: 400 },
    );
  }
  const title = typeof body?.title === "string" ? body.title.slice(0, 255) : null;
  const text = typeof body?.body === "string" ? body.body.slice(0, 4000) : null;

  const existing = await findReviewByCustomer({
    tenant_id: resolved.tenant_id,
    site_id: resolved.site_id,
    product_id: resolved.product_id,
    customer_id: session.customer_id,
  });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "already_reviewed" },
      { status: 409 },
    );
  }

  const is_verified = await customerHasPurchasedProduct({
    tenant_id: resolved.tenant_id,
    customer_id: session.customer_id,
    product_id: resolved.product_id,
  });

  const review = await createProductReview({
    tenant_id: resolved.tenant_id,
    site_id: resolved.site_id,
    product_id: resolved.product_id,
    customer_id: session.customer_id,
    customer_name: session.name ?? session.email ?? null,
    rating,
    title,
    body: text,
    is_verified,
  });
  return NextResponse.json({ ok: true, review });
}
