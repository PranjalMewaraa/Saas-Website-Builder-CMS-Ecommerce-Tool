import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUsersByEmail } from "../db-mongo/users.repo";
export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const users = await findUsersByEmail(email);
        if (!users.length) return null;
        if (users.length > 1) {
          // avoid ambiguous login when same email exists in multiple tenants
          return null;
        }
        const user = users[0];
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;

        return {
          id: user._id,
          tenant_id: user.tenant_id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_superadmin: user.is_superadmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.user_id = user.id;
        token.tenant_id = user.tenant_id;
        token.role = user.role;
        token.is_superadmin = user.is_superadmin;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.user_id = token.user_id;
      session.user.tenant_id = token.tenant_id;
      session.user.role = token.role;
      session.user.is_superadmin = token.is_superadmin;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
