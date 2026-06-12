export type Role = "owner" | "admin" | "editor" | "superadmin";

export function hasRole(userRole: Role, required: Role) {
  const order: Role[] = ["editor", "admin", "owner", "superadmin"];
  return order.indexOf(userRole) >= order.indexOf(required);
}

/**
 * Throws "FORBIDDEN" when the user's role is below `required`.
 * Not yet wired into routes (current policy: any authenticated tenant user
 * may perform any action). Use this to gate destructive/admin routes when a
 * role policy is introduced, e.g. `requireRole(session.user.role, "admin")`.
 */
export function requireRole(userRole: Role, required: Role) {
  if (!hasRole(userRole, required)) {
    throw new Error("FORBIDDEN");
  }
}
