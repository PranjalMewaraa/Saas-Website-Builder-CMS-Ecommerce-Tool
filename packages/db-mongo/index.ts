import { MongoClient } from "mongodb";

const uri: string =
  process.env.MONGODB_URI ||
  "mongodb+srv://mewarapranjal089_db_user:u0X7azwGcE1DdXdi@saasbuilder.cybysp4.mongodb.net/?appName=saasbuilder";
const dbName = process.env.MONGODB_DB || "saasbuilder";

if (!uri) throw new Error("Missing MONGODB_URI in env");
if (!dbName) throw new Error("Missing MONGODB_DB in env");

let client: MongoClient | null = null;

export async function getMongoClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function getMongoDb() {
  const c = await getMongoClient();
  return c.db(dbName);
}
export * from "./users.repo";
export * from "./tenants.repo";
export * from "./sites.repo";
export * from "./indexes";
export * from "./themes.repo";
export * from "./menu.repo";
export * from "./pages.repo";
export * from "./stylePresets.repo";
export * from "./snapshots.repo";
export * from "./sites.preview";
export * from "./assets.repo";
export * from "./forms.repo";
export * from "./formSubmission.repo";
export * from "./rateLimit.repo";
export * from "./sectionTemplates.repo";
