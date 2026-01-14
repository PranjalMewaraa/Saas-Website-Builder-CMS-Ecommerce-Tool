import { getServerSession } from "next-auth";
import { authOptions } from "./server-options";

export async function requireSession() {
  const session = await getServerSession(authOptions as any);
  if (!session || !(session as any).user?.tenant_id) {
    throw new Error("UNAUTHORIZED");
  }
  return session as any;
}
