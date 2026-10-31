import { createApp } from "./api/app";
import { env } from "./config/env";
import { connectDb } from "./db/connect";

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`myBucket API listening on :${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("failed to start server:", err);
  process.exit(1);
});
