import jwt from "jsonwebtoken";

import { env } from "../config/env";

export interface SessionPayload {
  userId: string;
}

const SESSION_TTL = "30d";

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: SESSION_TTL });
}

export function verifySession(token: string): SessionPayload {
  return jwt.verify(token, env.JWT_SECRET) as SessionPayload;
}
