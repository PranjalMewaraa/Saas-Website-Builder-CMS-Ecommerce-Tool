export type Role = "owner" | "admin" | "editor" | "superadmin";

export function hasRole(userRole: Role, required: Role) {
  const order: Role[] = ["editor", "admin", "owner", "superadmin"];
  return order.indexOf(userRole) >= order.indexOf(required);
}
