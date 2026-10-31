import mongoose from "mongoose";

import { env } from "../config/env";

export async function connectDb(): Promise<void> {
  // Fails fast with a clear error instead of hanging silently on a blocked
  // or unreachable network path.
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
}
