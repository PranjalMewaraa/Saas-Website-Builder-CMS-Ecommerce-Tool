import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export type CustomerSession = {
  customer_id: string;
  tenant_id: string;
  site_id: string;
  email: string;
  name?: string | null;
};

export async function getCustomerSession(
  req: NextRequest | Request,
): Promise<CustomerSession | null> {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token?.customer_id || !token?.tenant_id || !token?.site_id) {
    return null;
  }
  return {
    customer_id: String(token.customer_id),
    tenant_id: String(token.tenant_id),
    site_id: String(token.site_id),
    email: String(token.email ?? ""),
    name: (token.name as string | undefined) ?? null,
  };
}

export async function requireCustomerSession(
  req: NextRequest | Request,
): Promise<CustomerSession> {
  const session = await getCustomerSession(req);
  if (!session) {
    throw new CustomerUnauthorizedError();
  }
  return session;
}

export class CustomerUnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "CustomerUnauthorizedError";
  }
}
