import bcrypt from "bcryptjs";
import { getMongoDb } from "@acme/db-mongo";

async function run() {
  const db = await getMongoDb();
  const users = db.collection("users");

  const tenant_id = "t_demo";
  const email = "owner@demo.com";
  const password = "Password123!";
  const password_hash = await bcrypt.hash(password, 10);

  await users.updateOne(
    { tenant_id, email },
    {
      $set: {
        _id: "u_demo_owner",
        tenant_id,
        email,
        name: "Demo Owner",
        password_hash,
        role: "owner",
        is_superadmin: false,
        updated_at: new Date(),
      },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true }
  );

  console.log("Seeded user:", { tenant_id, email, password });
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
