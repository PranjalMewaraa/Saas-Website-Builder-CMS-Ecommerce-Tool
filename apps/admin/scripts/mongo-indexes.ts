import { ensureMongoIndexes } from "../../../packages/db-mongo/indexes";

async function run() {
  await ensureMongoIndexes();
  console.log("Mongo indexes ensured ✅");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
