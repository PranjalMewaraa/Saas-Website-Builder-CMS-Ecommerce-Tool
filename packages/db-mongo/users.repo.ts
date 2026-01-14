import { getMongoDb } from "./index";
import type { WithId, Document } from "mongodb";

export type UserRole = "owner" | "admin" | "editor" | "superadmin";

export type UserDoc = {
  _id: string; // user_id (ULID/UUID)
  tenant_id: string;
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  is_superadmin: boolean;
  created_at: Date;
  updated_at: Date;
};

export async function usersCollection() {
  const db = await getMongoDb();
  return db.collection<UserDoc>("users");
}

export async function findUserByEmail(tenant_id: string, email: string) {
  const col = await usersCollection();
  return col.findOne({ tenant_id, email: email.toLowerCase() });
}

export async function findUserById(user_id: string) {
  const col = await usersCollection();
  return col.findOne({ _id: user_id });
}
