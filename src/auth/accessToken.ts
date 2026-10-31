import { createHash, randomBytes } from "node:crypto";

import { AccessTokenModel } from "../db/models/accessToken";

// generateToken returns the raw token (shown once to the user) and its hash
// (what gets stored) — we never persist the raw value.
export function generateToken(): { raw: string; hash: string } {
  const raw = `mb_${randomBytes(24).toString("hex")}`;
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function resolveUserIdFromToken(raw: string): Promise<string | null> {
  const hash = hashToken(raw);
  const token = await AccessTokenModel.findOne({ tokenHash: hash });
  if (!token) return null;
  token.lastUsedAt = new Date();
  await token.save();
  return token.userId.toString();
}
