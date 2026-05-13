import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  findCustomerUserByEmail,
  createCustomerUser,
} from "@acme/db-mysql";
import { resolveSiteFromRequest } from "@/lib/resolve-site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 },
    );
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name =
    typeof body?.name === "string" ? body.name.trim().slice(0, 255) : null;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "weak_password", message: "Min 8 characters" },
      { status: 400 },
    );
  }

  const site = await resolveSiteFromRequest(req, {
    site_id: body?.site_id,
    handle: body?.handle,
  });
  if (!site) {
    return NextResponse.json(
      { ok: false, error: "site_not_found" },
      { status: 404 },
    );
  }

  const existing = await findCustomerUserByEmail({
    tenant_id: site.tenant_id,
    site_id: String(site._id),
    email,
  });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "email_in_use" },
      { status: 409 },
    );
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await createCustomerUser({
    tenant_id: site.tenant_id,
    site_id: String(site._id),
    email,
    password_hash,
    name,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tenant_id: user.tenant_id,
      site_id: user.site_id,
    },
  });
}
