import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  createTenant,
  createUser,
  deleteTenant,
  findUsersByEmail,
} from "@acme/db-mongo/";
import { parseOrThrow, SignupSchema } from "@acme/schemas";

function isDuplicateKeyError(err: unknown) {
  return Boolean(err && typeof err === "object" && (err as any).code === 11000);
}

export async function POST(req: Request) {
  let input;
  try {
    input = parseOrThrow(SignupSchema, await req.json());
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || "Invalid input") },
      { status: 400 },
    );
  }

  // Fast-path check (the unique index below is the real guarantee).
  const existing = await findUsersByEmail(input.email);
  if (existing.length > 0) {
    return NextResponse.json(
      { ok: false, error: "Email already in use. Please login instead." },
      { status: 409 },
    );
  }

  const tenant_id = `t_${randomUUID()}`;
  const user_id = `u_${randomUUID()}`;

  await createTenant({ tenant_id });

  try {
    await createUser({
      user_id,
      tenant_id,
      email: input.email,
      password: input.password,
      name: input.name,
    });
  } catch (err) {
    // Compensate: the tenant has no owner, so don't leave it orphaned.
    await deleteTenant(tenant_id);
    if (isDuplicateKeyError(err)) {
      return NextResponse.json(
        { ok: false, error: "Email already in use. Please login instead." },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json({ ok: true, tenant_id });
}
