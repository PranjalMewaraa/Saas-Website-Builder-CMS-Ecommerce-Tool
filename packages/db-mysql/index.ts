import mysql from "mysql2/promise";

const host = process.env.MYSQL_HOST || "localhost";
const port = Number(process.env.MYSQL_PORT || 3306);
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE || "saas_builder";

if (!host || !user || !database) throw new Error("Missing MySQL env vars");
if (password == null)
  throw new Error("Missing MYSQL_PASSWORD env var");

export const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 10,
});

export async function pingMysql() {
  const [rows] = await pool.query("SELECT 1 as ok");
  return rows;
}
export * from "./types";
export * from "./id";
export * from "./stores.repo";
export * from "./brands.repo";
export * from "./categories.repo";
export * from "./products.repo";
export * from "./attributes.repo";
export * from "./attributeValue.repo";
export * from "./projectWizard.repo";
export * from "./commerceV2.repo";
export * from "./storeTypePresets";
export * from "./promotions.repo";
export * from "./customerUsers.repo";
export * from "./reviews.repo";
