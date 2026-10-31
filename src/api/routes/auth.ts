import { Router } from "express";
import { z } from "zod";

import { hashPassword, verifyPassword } from "../../auth/password";
import { signSession } from "../../auth/jwt";
import { requireAuth } from "../../auth/middleware";
import { UserModel } from "../../db/models/user";

export const authRouter = Router();

const credentialsSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(8),
});

function setSessionCookie(res: import("express").Response, userId: string) {
  const session = signSession({ userId });
  res.cookie("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

authRouter.post("/register", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await UserModel.findOne({ username: parsed.data.username });
  if (existing) {
    res.status(409).json({ error: "username already taken" });
    return;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await UserModel.create({ username: parsed.data.username, passwordHash });

  setSessionCookie(res, user._id.toString());
  res.status(201).json({ user: { id: user._id, username: user.username } });
});

authRouter.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = await UserModel.findOne({ username: parsed.data.username });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "invalid username or password" });
    return;
  }

  setSessionCookie(res, user._id.toString());
  res.json({ user: { id: user._id, username: user.username } });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("session");
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  res.json({ user: { id: user._id, username: user.username } });
});
