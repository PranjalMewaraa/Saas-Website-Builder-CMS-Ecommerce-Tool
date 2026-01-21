import { NextResponse } from "next/server";
import { createTenant } from "@acme/db-mongo/";
import { createUser } from "@acme/db-mongo/";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { ok: false, error: "Missing fields" },
      { status: 400 },
    );
  }

  const tenant_id = id("t");
  const user_id = id("u");

  await createTenant({ tenant_id });
  await createUser({
    user_id,
    tenant_id,
    email,
    password,
    name,
  });

  return NextResponse.json({ ok: true, tenant_id });
}
