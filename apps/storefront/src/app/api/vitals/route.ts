import { NextResponse } from "next/server";
import { getMongoDb } from "@acme/db-mongo";

export async function POST(req: Request) {
  const data = await req.json();
  const db = await getMongoDb();
  await db
    .collection("web_vitals")
    .insertOne({ ...data, created_at: new Date() });
  return NextResponse.json({ ok: true });
}
