import NextAuth from "next-auth";
import { customerAuthOptions } from "@/lib/auth/customer-auth-options";

const handler = NextAuth(customerAuthOptions);
export { handler as GET, handler as POST };
