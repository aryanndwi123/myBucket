import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import { verifySession } from "./jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
    }
  }
}

// requireAuth reads the session cookie, verifies it, and attaches userId to
// the request. Responds 401 if missing/invalid.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.session;
  if (!token) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  try {
    const payload = verifySession(token);
    req.userId = new Types.ObjectId(payload.userId);
    next();
  } catch {
    res.status(401).json({ error: "invalid or expired session" });
  }
}
