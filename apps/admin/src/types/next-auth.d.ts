import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      user_id: string;
      tenant_id: string;
      role: string;
      is_superadmin: boolean;
      email?: string | null;
      name?: string | null;
    };
  }
}
