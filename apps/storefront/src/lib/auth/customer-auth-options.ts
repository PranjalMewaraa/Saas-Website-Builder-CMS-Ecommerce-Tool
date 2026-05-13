import Credentials from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import {
  findCustomerUserByEmail,
  recordCustomerLogin,
} from "@acme/db-mysql";

export const customerAuthOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/account/login" },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenant_id: { label: "Tenant", type: "text" },
        site_id: { label: "Site", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials.password ||
          !credentials.tenant_id ||
          !credentials.site_id
        ) {
          return null;
        }
        const user = await findCustomerUserByEmail({
          tenant_id: String(credentials.tenant_id),
          site_id: String(credentials.site_id),
          email: String(credentials.email),
        });
        if (!user) return null;
        const ok = await bcrypt.compare(
          String(credentials.password),
          user.password_hash,
        );
        if (!ok) return null;
        await recordCustomerLogin(user.id).catch(() => {});
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          tenant_id: user.tenant_id,
          site_id: user.site_id,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.customer_id = u.id;
        token.tenant_id = u.tenant_id;
        token.site_id = u.site_id;
        token.email = u.email;
        token.name = u.name;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).customer = {
        id: token.customer_id,
        tenant_id: token.tenant_id,
        site_id: token.site_id,
        email: token.email,
        name: token.name,
      };
      return session;
    },
  },
};
