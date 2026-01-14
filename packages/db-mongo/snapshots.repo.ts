import { getMongoDb, snapshotsCollection } from "./index";

export async function createSnapshot(snapshot: any) {
  const col = await snapshotsCollection();
  await col.insertOne(snapshot);
  return snapshot;
}
